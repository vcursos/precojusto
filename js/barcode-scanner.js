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
        if (availableCameras.length <= 1) return;
        
        currentCameraIndex = (currentCameraIndex + 1) % availableCameras.length;
        console.log('Trocando para câmera:', currentCameraIndex);
        
        // Parar scanner atual e reiniciar com nova câmera
        await stopCameraStream();
        setTimeout(() => startCamera(), 300);
    }

    // Parar stream da câmera
    async function stopCameraStream() {
        console.log('Parando câmera...');
        
        try {
            if (currentStream) {
                currentStream.getTracks().forEach(track => {
                    track.stop();
                    console.log('Track parado:', track.label);
                });
                currentStream = null;
            }
            
            if (quaggaInitialized && typeof Quagga !== 'undefined') {
                Quagga.stop();
                quaggaInitialized = false;
                console.log('Quagga parado');
            }
            
            if (scannerTarget) {
                scannerTarget.innerHTML = '';
            }
            
            scannerActive = false;
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

            // Definir constraints
            let constraints = { video: { facingMode: 'environment' } };
            
            if (availableCameras.length > 0) {
                const camera = availableCameras[currentCameraIndex];
                constraints = {
                    video: {
                        deviceId: { exact: camera.deviceId },
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                };
            }

            // Obter stream
            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            scannerActive = true;

            // Inicializar Quagga
            if (typeof Quagga === 'undefined') {
                showScannerMessage('Biblioteca Quagga não carregada', 'error');
                return;
            }

            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: scannerTarget,
                    constraints: constraints.video
                },
                decoder: {
                    readers: [
                        "ean_reader",
                        "ean_8_reader",
                        "code_128_reader",
                        "code_39_reader",
                        "upc_reader",
                        "upc_e_reader"
                    ]
                },
                locate: true,
                locator: {
                    patchSize: "medium",
                    halfSample: true
                }
            }, function(err) {
                if (err) {
                    console.error('Erro ao inicializar Quagga:', err);
                    showScannerMessage('Erro ao inicializar scanner', 'error');
                    return;
                }

                Quagga.start();
                quaggaInitialized = true;
                console.log('Quagga iniciado');
                
                if (scannerMessage) {
                    scannerMessage.textContent = 'Posicione o código de barras dentro da área destacada';
                }
            });

            // Detectar código de barras
            Quagga.onDetected(function(data) {
                if (!scannerActive) return;
                
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
            });

        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            showScannerMessage('Não foi possível acessar a câmera', 'error');
        }
    }

    // Abrir modal do scanner
    function openScannerModal() {
        if (!scannerModal) return;
        
        console.log('Abrindo scanner...');
        scannerModal.classList.add('show');
        scannerModal.style.display = 'flex';
        document.body.classList.add('modal-open');
        document.body.classList.add('scanner-active');
        
        // Resetar flash
        flashEnabled = false;
        if (toggleFlashBtn) {
            toggleFlashBtn.innerHTML = '<i class="fas fa-bolt"></i> Flash';
        }
        
        // Iniciar câmera após modal estar visível
        setTimeout(() => startCamera(), 300);
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
        
        document.body.classList.remove('modal-open');
        document.body.classList.remove('scanner-active');
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
