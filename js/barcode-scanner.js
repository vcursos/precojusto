// ===== SCANNER DE CÓDIGO DE BARRAS (Quagga) =====
// Sistema completo de scanner com flash, trocar câmera, beep e mensagens

(function() {
    'use strict';

    // Elementos do DOM
    const scannerModal = document.getElementById('scanner-modal');
    const scannerTarget = document.getElementById('scanner-target');
    const scannerMessage = document.getElementById('scanner-message');
    const scannerResult = document.getElementById('scanner-result');
    const closeScannerBtn = document.getElementById('close-scanner');
    const stopScannerBtn = document.getElementById('stop-scanner');
    const toggleFlashBtn = document.getElementById('toggle-flash');
    const switchCameraBtn = document.getElementById('switch-camera');
    const barcodeSearchBtn = document.getElementById('barcode-search-btn');

    // Estado do scanner
    let currentStream = null;
    let quaggaInitialized = false;
    let flashEnabled = false;
    let currentCameraIndex = 0;
    let availableCameras = [];
    let scannerActive = false;
    let isSwitchingCamera = false; // Flag para suprimir erros durante troca

    // Beep sonoro ao detectar código
    function playBeep() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(880, ctx.currentTime);
            g.gain.setValueAtTime(0.3, ctx.currentTime);
            o.connect(g);
            g.connect(ctx.destination);
            o.start();
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
            o.stop(ctx.currentTime + 0.2);
        } catch(e) {
            console.warn('Erro ao tocar beep:', e);
        }
    }

    // Mostrar mensagem no scanner
    function showScannerMessage(message, type = 'info') {
        // Não mostrar mensagens de erro durante troca de câmera
        if (type === 'error' && isSwitchingCamera) {
            console.log('Mensagem de erro suprimida (trocando câmera):', message);
            return;
        }
        
        if (!scannerResult) return;
        scannerResult.textContent = message;
        scannerResult.className = 'scanner-result show';
        if (type === 'error') {
            scannerResult.classList.add('error');
        } else {
            scannerResult.classList.remove('error');
        }
        setTimeout(() => {
            scannerResult.classList.remove('show');
        }, 3000);
    }

    // Listar câmeras disponíveis
    async function getCameras() {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            availableCameras = devices.filter(d => d.kind === 'videoinput');
            console.log('Câmeras encontradas:', availableCameras.length);
            
            // Desabilitar botão de trocar câmera se houver apenas uma
            if (switchCameraBtn) {
                switchCameraBtn.disabled = availableCameras.length <= 1;
            }
        } catch (err) {
            console.error('Erro ao listar câmeras:', err);
            availableCameras = [];
        }
    }

    // Alternar flash (quando suportado)
    async function toggleFlash() {
        if (!currentStream) return;
        
        try {
            const track = currentStream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            
            if (capabilities.torch) {
                flashEnabled = !flashEnabled;
                await track.applyConstraints({
                    advanced: [{ torch: flashEnabled }]
                });
                
                if (toggleFlashBtn) {
                    toggleFlashBtn.innerHTML = flashEnabled 
                        ? '<i class="fas fa-bolt"></i> Flash Ligado'
                        : '<i class="fas fa-bolt"></i> Flash';
                }
                console.log('Flash:', flashEnabled ? 'Ligado' : 'Desligado');
            } else {
                showScannerMessage('Flash não suportado nesta câmera', 'error');
            }
        } catch (err) {
            console.error('Erro ao alternar flash:', err);
            showScannerMessage('Erro ao ativar flash', 'error');
        }
    }

    // Trocar entre câmeras
    async function switchCamera() {
        if (availableCameras.length <= 1) {
            console.log('Apenas uma câmera disponível');
            return;
        }
        
        console.log('=== INICIANDO TROCA DE CÂMERA ===');
        console.log('Câmera atual:', currentCameraIndex);
        
        // Ativar flag para suprimir erros durante troca
        isSwitchingCamera = true;
        
        currentCameraIndex = (currentCameraIndex + 1) % availableCameras.length;
        console.log('Nova câmera:', currentCameraIndex);
        
        // Desabilitar botões temporariamente
        if (switchCameraBtn) {
            switchCameraBtn.disabled = true;
        }
        if (toggleFlashBtn) {
            toggleFlashBtn.disabled = true;
        }
        
        // Mostrar mensagem
        if (scannerMessage) {
            scannerMessage.textContent = 'Trocando câmera...';
        }
        
        // Parar scanner atual completamente
        await stopCameraStream();
        
        // Aguardar mais tempo para garantir que tudo foi limpo (iOS precisa de mais tempo)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const delay = isIOS ? 800 : 700;
        
        console.log(`Aguardando ${delay}ms antes de reiniciar...`);
        
        setTimeout(async () => {
            console.log('Reiniciando câmera...');
            await startCamera();
            // Reabilitar botões após reinicialização
            if (switchCameraBtn) {
                switchCameraBtn.disabled = availableCameras.length <= 1;
            }
            // Desativar flag após troca completa (dar tempo extra para Quagga estabilizar)
            setTimeout(() => {
                isSwitchingCamera = false;
                console.log('=== TROCA DE CÂMERA CONCLUÍDA ===');
            }, 1000); // Aumentado de 500ms para 1000ms
        }, delay);
    }

    // Parar stream da câmera
    async function stopCameraStream() {
        console.log('Parando câmera...');
        
        // Marcar como inativo imediatamente
        scannerActive = false;
        
        try {
            // Primeiro para o Quagga antes do stream
            if (quaggaInitialized && typeof Quagga !== 'undefined') {
                try {
                    console.log('Removendo listener e parando Quagga...');
                    Quagga.offDetected(handleBarcodeDetection); // Remove listener específico
                    Quagga.offProcessed(); // Remove listener de processamento também
                    Quagga.stop();
                    console.log('✓ Quagga parado');
                } catch (e) {
                    console.warn('Erro ao parar Quagga:', e);
                }
                quaggaInitialized = false;
            }
            
            // Depois para os tracks do stream
            if (currentStream) {
                currentStream.getTracks().forEach(track => {
                    track.stop();
                    console.log('✓ Track parado:', track.label);
                });
                currentStream = null;
            }
            
            // Limpa o elemento visual completamente
            if (scannerTarget) {
                scannerTarget.innerHTML = '';
                // Força limpeza de canvas e vídeos
                const videos = scannerTarget.getElementsByTagName('video');
                const canvases = scannerTarget.getElementsByTagName('canvas');
                Array.from(videos).forEach(v => v.remove());
                Array.from(canvases).forEach(c => c.remove());
            }
            
            flashEnabled = false;
            
            // Resetar botão de flash
            if (toggleFlashBtn) {
                toggleFlashBtn.innerHTML = '<i class="fas fa-bolt"></i> Flash';
                toggleFlashBtn.style.display = 'none';
            }
            
            console.log('✓ Câmera parada completamente');
            
            // Aguardar um pouco para garantir limpeza completa
            await new Promise(resolve => setTimeout(resolve, 200));
            
        } catch (error) {
            console.error('Erro ao parar câmera:', error);
        }
    }

    // Iniciar câmera e Quagga
    async function startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showScannerMessage('Câmera não suportada neste navegador', 'error');
            return;
        }

        try {
            // Buscar câmeras se ainda não listadas
            if (availableCameras.length === 0) {
                await getCameras();
            }

            // Definir constraints com fallbacks para iOS
            let constraints = { 
                video: { 
                    facingMode: { ideal: 'environment' },
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 480, ideal: 720, max: 1080 }
                } 
            };
            
            if (availableCameras.length > 0) {
                const camera = availableCameras[currentCameraIndex];
                constraints = {
                    video: {
                        deviceId: { exact: camera.deviceId },
                        width: { min: 640, ideal: 1280, max: 1920 },
                        height: { min: 480, ideal: 720, max: 1080 }
                    }
                };
            }

            console.log('Iniciando câmera com constraints:', constraints);

            // Obter stream
            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            scannerActive = true;

            console.log('Stream da câmera obtido com sucesso');

            // Atualizar controles ANTES de inicializar Quagga
            updateCameraControls();

            // Inicializar Quagga com try-catch para capturar erros síncronos
            if (typeof Quagga === 'undefined') {
                showScannerMessage('Biblioteca Quagga não carregada', 'error');
                return;
            }

            try {
                Quagga.init({
                    inputStream: {
                        name: "Live",
                        type: "LiveStream",
                        target: scannerTarget,
                        constraints: constraints.video,
                        singleChannel: false
                    },
                    locator: {
                        patchSize: "medium",
                        halfSample: true
                    },
                    numOfWorkers: navigator.hardwareConcurrency || 4,
                    decoder: {
                        readers: [
                            "ean_reader",
                            "ean_8_reader",
                            "code_128_reader",
                            "code_39_reader",
                            "upc_reader",
                            "upc_e_reader"
                        ],
                        multiple: false
                    },
                    locate: true
                }, function(err) {
                    if (err) {
                        console.error('Erro ao inicializar Quagga:', err);
                        // showScannerMessage já verifica isSwitchingCamera
                        showScannerMessage('Erro ao inicializar scanner: ' + (err.message || err), 'error');
                        return;
                    }

                    console.log('✓ Quagga inicializado com sucesso');
                    
                    try {
                        Quagga.start();
                        quaggaInitialized = true;
                        console.log('✓ Quagga iniciado');
                        
                        // Registrar listener APÓS Quagga estar iniciado
                        Quagga.onDetected(handleBarcodeDetection);
                        console.log('✓ Listener de detecção registrado');
                        
                        if (scannerMessage) {
                            scannerMessage.textContent = 'Posicione o código de barras dentro da área destacada';
                        }
                    } catch (startErr) {
                        console.error('Erro ao iniciar Quagga:', startErr);
                        // showScannerMessage já verifica isSwitchingCamera
                        showScannerMessage('Erro ao iniciar scanner: ' + startErr.message, 'error');
                        quaggaInitialized = false;
                    }
                });
            } catch (initErr) {
                console.error('Erro síncrono ao inicializar Quagga:', initErr);
                // showScannerMessage já verifica isSwitchingCamera
                showScannerMessage('Erro ao configurar scanner: ' + initErr.message, 'error');
            }

        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            
            // Mensagens específicas para diferentes erros
            let errorMessage = 'Não foi possível acessar a câmera';
            
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = 'Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações.';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage = 'Câmera está sendo usada por outro aplicativo.';
            } else if (error.name === 'OverconstrainedError') {
                errorMessage = 'Configuração de câmera não suportada. Tentando novamente...';
                
                // Tentar com constraints mais simples (especialmente para iOS)
                try {
                    console.log('Tentando com constraints simplificadas...');
                    const simpleConstraints = { video: { facingMode: 'environment' } };
                    currentStream = await navigator.mediaDevices.getUserMedia(simpleConstraints);
                    scannerActive = true;
                    
                    // Reiniciar Quagga com configuração simplificada
                    Quagga.init({
                        inputStream: {
                            name: "Live",
                            type: "LiveStream",
                            target: scannerTarget,
                            constraints: { facingMode: 'environment' }
                        },
                        decoder: {
                            readers: ["ean_reader", "ean_8_reader", "code_128_reader", "upc_reader"]
                        }
                    }, function(err) {
                        if (!err) {
                            Quagga.start();
                            quaggaInitialized = true;
                            console.log('Quagga iniciado com configuração simplificada');
                        }
                    });
                    return;
                } catch (retryError) {
                    console.error('Erro na segunda tentativa:', retryError);
                }
            }
            
            showScannerMessage(errorMessage, 'error');
            
            // No iOS, sugerir abrir no Safari
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (isIOS && scannerMessage) {
                scannerMessage.innerHTML = errorMessage + '<br><small>Certifique-se de estar usando o Safari.</small>';
            }
        }
    }

    // Handler de detecção de código (separado para poder remover listener)
    function handleBarcodeDetection(data) {
        if (!scannerActive || !data || !data.codeResult) return;
        
        const barcode = data.codeResult.code;
        console.log('Código detectado:', barcode);
        
        // Tocar beep
        playBeep();
        
        // Buscar produto
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const product = products.find(p => String(p.barcode) === String(barcode));
        
        if (product) {
            showScannerMessage(`✓ ${product.name}`, 'success');
            
            // Preencher campo de busca
            const barcodeSearchBar = document.getElementById('barcode-search-bar');
            if (barcodeSearchBar) {
                barcodeSearchBar.value = barcode;
                barcodeSearchBar.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            // Abrir comparação após breve delay
            setTimeout(() => {
                closeScannerModal();
                if (typeof openCompareModal === 'function') {
                    openCompareModal(product.name);
                }
            }, 800);
        } else {
            showScannerMessage('✗ Produto não encontrado', 'error');
            
            // Preencher campo mesmo assim
            const barcodeSearchBar = document.getElementById('barcode-search-bar');
            if (barcodeSearchBar) {
                barcodeSearchBar.value = barcode;
            }
            
            // Fechar após mostrar mensagem
            setTimeout(() => closeScannerModal(), 2000);
        }
    }

    // Atualizar controles da câmera (flash, trocar câmera)
    function updateCameraControls() {
        if (!currentStream) {
            console.warn('updateCameraControls: sem stream ativo');
            return;
        }
        
        try {
            const track = currentStream.getVideoTracks()[0];
            if (!track) {
                console.warn('updateCameraControls: sem track de vídeo');
                return;
            }
            
            const capabilities = track.getCapabilities();
            const settings = track.getSettings();
            
            console.log('=== CONTROLES DA CÂMERA ===');
            console.log('FacingMode:', settings.facingMode || 'desconhecida');
            console.log('Capabilities:', capabilities);
            
            // Verificar suporte ao flash
            if (toggleFlashBtn) {
                if (capabilities.torch) {
                    toggleFlashBtn.style.display = 'inline-block';
                    toggleFlashBtn.disabled = false;
                    toggleFlashBtn.innerHTML = '<i class="fas fa-bolt"></i> Flash';
                    flashEnabled = false; // Reset estado
                    console.log('✓ Flash DISPONÍVEL nesta câmera');
                } else {
                    toggleFlashBtn.style.display = 'none';
                    toggleFlashBtn.disabled = true;
                    flashEnabled = false;
                    console.log('✗ Flash NÃO DISPONÍVEL nesta câmera');
                }
            }
            
            // Atualizar botão de trocar câmera
            if (switchCameraBtn) {
                const canSwitch = availableCameras.length > 1;
                switchCameraBtn.disabled = !canSwitch;
                console.log(`Trocar câmera: ${canSwitch ? 'habilitado' : 'desabilitado'}`);
            }
            
            console.log('=========================');
        } catch (err) {
            console.error('Erro ao atualizar controles:', err);
        }
    }

    // Abrir modal do scanner
    function openScannerModal() {
        if (!scannerModal) return;
        
        console.log('Abrindo scanner...');
        
        // Detectar iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIOS) {
            console.log('Dispositivo iOS detectado');
        }
        
        scannerModal.classList.add('show');
        scannerModal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // Resetar flash
        flashEnabled = false;
        if (toggleFlashBtn) {
            toggleFlashBtn.innerHTML = '<i class="fas fa-bolt"></i> Flash';
        }
        
        // Mostrar mensagem de carregamento
        if (scannerMessage) {
            scannerMessage.textContent = 'Solicitando acesso à câmera...';
        }
        
        // Iniciar câmera após modal estar visível (iOS precisa de mais tempo)
        setTimeout(() => startCamera(), isIOS ? 500 : 300);
    }

    // Fechar modal do scanner
    function closeScannerModal() {
        console.log('Fechando scanner...');
        
        stopCameraStream();
        
        if (scannerModal) {
            scannerModal.classList.remove('show');
            setTimeout(() => {
                scannerModal.style.display = 'none';
            }, 300);
        }

        // Desbloquear scroll de forma robusta (compatível com script.js)
        try {
            // Remover classe de bloqueio
            document.body.classList.remove('modal-open');
            // Se existir função global de desbloqueio, usar
            if (typeof window.unlockBodyScroll === 'function') {
                window.unlockBodyScroll();
            } else {
                // Fallback: limpar estilos inline que possam ter sido aplicados
                const prevTop = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                // Restaurar posição de scroll se necessário
                if (prevTop) {
                    const y = parseInt(prevTop || '0') * -1;
                    if (!isNaN(y)) window.scrollTo(0, y);
                }
            }
        } catch (_) {
            // segurança
        }
    }

    // Event listeners
    if (closeScannerBtn) {
        closeScannerBtn.addEventListener('click', closeScannerModal);
    }

    if (stopScannerBtn) {
        stopScannerBtn.addEventListener('click', closeScannerModal);
    }

    if (toggleFlashBtn) {
        toggleFlashBtn.addEventListener('click', toggleFlash);
    }

    if (switchCameraBtn) {
        switchCameraBtn.addEventListener('click', switchCamera);
    }

    if (barcodeSearchBtn) {
        barcodeSearchBtn.addEventListener('click', openScannerModal);
    }

    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && scannerModal && scannerModal.classList.contains('show')) {
            closeScannerModal();
        }
    });

    // Fechar clicando fora
    if (scannerModal) {
        scannerModal.addEventListener('click', function(e) {
            if (e.target === scannerModal) {
                closeScannerModal();
            }
        });
    }

    // Expor função globalmente
    window.openBarcodeScanner = openScannerModal;

    console.log('✓ Scanner de código de barras carregado');

})();
