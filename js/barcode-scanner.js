// ===== SCANNER DE CÓDIGO DE BARRAS (Quagga) =====
// Sistema completo de scanner com flash, trocar câmera, beep e mensagens

(function() {
    // --- MODAL DE CONFIRMAÇÃO ANTES DE ABRIR SCANNER (APLICA EM TODAS VERSÕES) ---
    function showScannerConfirmModal() {
        var confirmModal = document.getElementById('scanner-confirm-modal');
        if (!confirmModal) return;
        confirmModal.style.display = 'block';
        confirmModal.setAttribute('aria-hidden', 'false');
        confirmModal.focus();
        document.body.classList.add('modal-open');
    }
    function hideScannerConfirmModal() {
        var confirmModal = document.getElementById('scanner-confirm-modal');
        if (!confirmModal) return;
        confirmModal.style.display = 'none';
        confirmModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }
    window.openBarcodeScanner = function() {
        showScannerConfirmModal();
    };
    document.addEventListener('DOMContentLoaded', function() {
        var okBtn = document.getElementById('confirm-open-scanner');
        if (okBtn) {
            okBtn.addEventListener('click', function(e) {
                hideScannerConfirmModal();
                if (window.__realOpenBarcodeScanner) {
                    window.__realOpenBarcodeScanner();
                }
            });
        }
        var closeBtn = document.getElementById('close-scanner-confirm');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                hideScannerConfirmModal();
            });
        }
    });
    if (!window.__realOpenBarcodeScanner) {
        window.__realOpenBarcodeScanner = function() {
            if (typeof window.__startScannerModal === 'function') {
                window.__startScannerModal();
            } else if (typeof window.__legacyOpenBarcodeScanner === 'function') {
                window.__legacyOpenBarcodeScanner();
            }
        };
    }
    // --- MODAL DE CONFIRMAÇÃO ANTES DE ABRIR SCANNER ---
    function showScannerConfirmModal() {
        const confirmModal = document.getElementById('scanner-confirm-modal');
        if (!confirmModal) return;
        confirmModal.style.display = 'block';
        confirmModal.setAttribute('aria-hidden', 'false');
        confirmModal.focus();
        // Bloquear scroll e interação
        document.body.classList.add('modal-open');
    }

    function hideScannerConfirmModal() {
        const confirmModal = document.getElementById('scanner-confirm-modal');
        if (!confirmModal) return;
        confirmModal.style.display = 'none';
        confirmModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    // Interceptar todos triggers do scanner para exibir confirmação
    window.openBarcodeScanner = function() {
        showScannerConfirmModal();
    };

    // Botão OK do modal de confirmação
    document.addEventListener('DOMContentLoaded', function() {
        const okBtn = document.getElementById('confirm-open-scanner');
        if (okBtn) {
            okBtn.addEventListener('click', function(e) {
                hideScannerConfirmModal();
                // Chamar scanner real
                if (window.__realOpenBarcodeScanner) {
                    window.__realOpenBarcodeScanner();
                }
            });
        }
        const closeBtn = document.getElementById('close-scanner-confirm');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                hideScannerConfirmModal();
            });
        }
    });

    // Guardar referência real do scanner
    if (!window.__realOpenBarcodeScanner) {
        window.__realOpenBarcodeScanner = function() {
            // ...código original de abrir scanner...
            if (typeof window.__startScannerModal === 'function') {
                window.__startScannerModal();
            } else if (typeof window.__legacyOpenBarcodeScanner === 'function') {
                window.__legacyOpenBarcodeScanner();
            }
        };
    }
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
    let previousFocusedElement = null; // Para restaurar foco ao fechar
    let tempLockedInputs = []; // Inputs bloqueados para evitar teclado
    let mainContainerRef = null; // referência para inert

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

    // Trocar entre câmeras - DESABILITADO (sempre usa câmera traseira)
    async function switchCamera() {
        console.log('Troca de câmera desabilitada - sempre usa câmera traseira');
        return;
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
            // SEMPRE usar câmera traseira (environment)
            const constraints = { 
                video: { 
                    facingMode: 'environment', // Forçar câmera traseira
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 480, ideal: 720, max: 1080 }
                } 
            };

            console.log('Iniciando câmera traseira com constraints:', constraints);

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
        
        // Desligar flash se estiver ligado
        if (flashEnabled && currentStream) {
            try {
                const track = currentStream.getVideoTracks()[0];
                track.applyConstraints({
                    advanced: [{ torch: false }]
                });
                flashEnabled = false;
                console.log('Flash desligado após detecção');
            } catch (e) {
                console.warn('Erro ao desligar flash:', e);
            }
        }
        
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
            
            // Ocultar botão de trocar câmera (sempre usa traseira)
            if (switchCameraBtn) {
                switchCameraBtn.style.display = 'none';
                console.log('Botão trocar câmera: OCULTO (sempre câmera traseira)');
            }
            
            console.log('=========================');
        } catch (err) {
            console.error('Erro ao atualizar controles:', err);
        }
    }

    // Abrir modal do scanner
    // Guardar listener de focusin apenas uma vez
    if (!window.__scannerFocusGuardAttached) {
        document.addEventListener('focusin', function(e) {
            try {
                if (scannerModal && scannerModal.classList.contains('show')) {
                    const t = e.target;
                    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) {
                        // Evitar foco em inputs enquanto scanner está aberto
                        t.blur();
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }
            } catch(_) {}
        }, true);
        window.__scannerFocusGuardAttached = true;
    }

    // BLOQUEIO ABSOLUTO: Interceptar QUALQUER tentativa de input enquanto scanner aberto
    if (!window.__scannerInputBlockAttached) {
        // Bloqueia eventos de teclado (keydown, keypress, keyup, input)
        ['keydown', 'keypress', 'keyup', 'input', 'beforeinput'].forEach(eventType => {
            document.addEventListener(eventType, function(e) {
                if (scannerModal && scannerModal.classList.contains('show')) {
                    const t = e.target;
                    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) {
                        // Bloquear completamente
                        e.stopPropagation();
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        // Forçar blur se ainda estiver focado
                        try { t.blur(); } catch(_) {}
                        return false;
                    }
                }
            }, true);
        });
        
        // Bloquear eventos de touch/click em inputs quando scanner aberto
        ['touchstart', 'touchend', 'mousedown', 'click'].forEach(eventType => {
            document.addEventListener(eventType, function(e) {
                if (scannerModal && scannerModal.classList.contains('show')) {
                    const t = e.target;
                    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') && !scannerModal.contains(t)) {
                        e.stopPropagation();
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return false;
                    }
                }
            }, true);
        });
        
        window.__scannerInputBlockAttached = true;
    }

    function openScannerModal() {
        if (!scannerModal) return;
        
        console.log('Abrindo scanner...');
        
        // Detectar iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIOS) {
            console.log('Dispositivo iOS detectado');
        }
        
        // Guardar elemento previamente focado
        previousFocusedElement = document.activeElement && document.activeElement !== document.body ? document.activeElement : null;

        // GARANTIR z-index máximo para modal ficar acima de tudo
        scannerModal.style.zIndex = '99999';
        
        scannerModal.classList.add('show');
        scannerModal.style.display = 'flex';
        document.body.classList.add('modal-open');        // Remover foco de qualquer campo de entrada para evitar teclado aberto / digitação indevida
        try {
            const blurIds = ['product-search-bar', 'barcode-search-bar'];
            blurIds.forEach(id => {
                const el = document.getElementById(id);
                if (el && typeof el.blur === 'function') el.blur();
            });
            if (document.activeElement && document.activeElement !== document.body && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }
        } catch (e) {
            console.warn('Falha ao remover foco dos inputs:', e);
        }

        // Garantir que o modal recebe foco para acessibilidade e evitar re-foco em inputs
        if (!scannerModal.hasAttribute('tabindex')) {
            scannerModal.setAttribute('tabindex', '-1');
        }
        try { scannerModal.focus(); } catch (_) {}

        // FORÇA BLUR IMEDIATO em todos inputs da página (antes de qualquer timeout)
        document.querySelectorAll('input, textarea').forEach(input => {
            if (!scannerModal.contains(input)) {
                try { input.blur(); } catch(_) {}
            }
        });

        // Tornar região principal inert (evita interação/foco fora do modal)
        mainContainerRef = document.getElementById('app-container');
        if (mainContainerRef) {
            try { mainContainerRef.setAttribute('inert', ''); } catch(_) {}
        }

        // Bloquear inputs fora do modal para evitar abertura de teclado
        tempLockedInputs = Array.from(document.querySelectorAll('input, textarea'))
            .filter(el => !scannerModal.contains(el));
        tempLockedInputs.forEach(el => {
            if (!el.readOnly) {
                el.dataset.prevReadonly = 'false';
                el.setAttribute('readonly', 'readonly');
            }
            // Adicionar desabilitação visual e de interação
            el.style.pointerEvents = 'none';
            el.setAttribute('tabindex', '-1');
            // Garante que não fique focado
            try { el.blur(); } catch(_) {}
        });

        // Ciclo extra de blur para casos em que o foco volta automaticamente (Android/iOS)
        setTimeout(() => {
            try {
                if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
                    document.activeElement.blur();
                }
                // Forçar blur em TODOS inputs novamente (iOS específico)
                tempLockedInputs.forEach(el => {
                    try { el.blur(); } catch(_) {}
                });
            } catch(_) {}
        }, 120);
        
        // Ciclo adicional para iOS (às vezes precisa de mais tempo)
        if (isIOS) {
            setTimeout(() => {
                try {
                    tempLockedInputs.forEach(el => {
                        try { el.blur(); } catch(_) {}
                    });
                    // Garantir que nada está focado
                    if (document.activeElement && document.activeElement.tagName === 'INPUT') {
                        document.activeElement.blur();
                    }
                } catch(_) {}
            }, 300);
        }
        
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

        // Remover inert da região principal
        if (mainContainerRef) {
            try { mainContainerRef.removeAttribute('inert'); } catch(_) {}
            mainContainerRef = null;
        }

        // Restaurar inputs bloqueados
        if (tempLockedInputs && tempLockedInputs.length) {
            tempLockedInputs.forEach(el => {
                if (el.dataset.prevReadonly === 'false') {
                    el.removeAttribute('readonly');
                }
                delete el.dataset.prevReadonly;
                // Restaurar interação
                el.style.pointerEvents = '';
                el.removeAttribute('tabindex');
            });
        }
        tempLockedInputs = [];

        // Restaurar foco ao elemento que acionou
        if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
            try { previousFocusedElement.focus(); } catch(_) {}
        }
        previousFocusedElement = null;
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
