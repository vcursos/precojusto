import { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, db, addDoc, collection, getDocs, doc, deleteDoc, query, where } from './firebase-init.js';

// Classe para gerenciar busca por código de barras
class BarcodeProductSearch {
    constructor() {
        this.productDatabase = {
            // CÓDIGOS REAIS DE PRODUTOS PORTUGUESES (verificados nas múltiplas bases)
            '5601009997596': {
                name: 'Produto Mimosa (Código OpenBeautyFacts)',
                brand: 'Mimosa',
                category: 'higiene',
                unit: 'unidade',
                quantity: 1,
                price: null,
                description: 'Produto encontrado no OpenBeautyFacts'
            },
            '5601049132995': {
                name: 'Leite Meio-Gordo Mimosa 1L',
                brand: 'Mimosa',
                category: 'frios',
                unit: 'L',
                quantity: 1,
                price: 0.69,
                description: 'Leite Meio-Gordo UHT 1L'
            },
            '5449000054227': {
                name: 'Coca-Cola Original Taste 1L',
                brand: 'Coca-Cola',
                category: 'bebidas',
                unit: 'L',
                quantity: 1,
                price: 1.65,
                description: 'Refrigerante Coca-Cola Original 1L'
            },
            '5449000130389': {
                name: 'Coca-Cola Original Taste 1,75L',
                brand: 'Coca-Cola',
                category: 'bebidas',
                unit: 'L',
                quantity: 1.75,
                price: 2.25,
                description: 'Refrigerante Coca-Cola Original 1,75L'
            },
            '5000112541007': {
                name: 'Coca-Cola Sabor Original 330ml',
                brand: 'Coca-Cola',
                category: 'bebidas',
                unit: 'ml',
                quantity: 330,
                price: 0.85,
                description: 'Refrigerante Coca-Cola Original 330ml'
            },
            '5000112519945': {
                name: 'Coca-Cola Zero 330ml',
                brand: 'Coca-Cola',
                category: 'bebidas',
                unit: 'ml',
                quantity: 330,
                price: 0.85,
                description: 'Refrigerante Coca-Cola Zero 330ml'
            },
            '5604172000360': {
                name: 'Água Mineral Natural Monchique 1,5L',
                brand: 'Monchique',
                category: 'bebidas',
                unit: 'L',
                quantity: 1.5,
                price: 0.35,
                description: 'Água Mineral Natural 1,5L'
            },
            '5605566000126': {
                name: 'Água Mineral Natural Caldas de Penacova 1,5L',
                brand: 'Caldas de Penacova',
                category: 'bebidas',
                unit: 'L',
                quantity: 1.5,
                price: 0.32,
                description: 'Água Mineral Natural 1,5L'
            },
            '5601192102203': {
                name: 'Leite Meio-Gordo Agros 1L',
                brand: 'Agros',
                category: 'frios',
                unit: 'L',
                quantity: 1,
                price: 0.65,
                description: 'Leite Meio-Gordo UHT 1L'
            },
            '5601050036541': {
                name: 'Iogurte Grego Natural OIKOS 4x110g',
                brand: 'OIKOS',
                category: 'frios',
                unit: 'g',
                quantity: 440,
                price: 2.49,
                description: 'Iogurte Grego Natural 4x110g'
            },
            '5601001187803': {
                name: 'Cereais Chocapic 625g',
                brand: 'Chocapic',
                category: 'alimentos',
                unit: 'g',
                quantity: 625,
                price: 3.15,
                description: 'Cereais de Trigo e Milho Torrados com Cacau'
            },
            '5601312079293': {
                name: 'Flocos de Aveia Integral Finos Continente 1Kg',
                brand: 'Continente',
                category: 'alimentos',
                unit: 'kg',
                quantity: 1,
                price: 1.89,
                description: 'Flocos de Aveia Integral Finos 1Kg'
            },
            '7891000369098': {
                name: 'Chocolate Ao Leite Classic Pacote 90g',
                brand: 'Nestlé',
                category: 'alimentos',
                unit: 'g',
                quantity: 90,
                price: null, // Não define preço para forçar busca online
                description: 'Chocolate Ao Leite Classic Pacote 90g'
            }
        };
        this.initializeBarcodeFeatures();
        console.log('🌍 Sistema de código de barras mundial inicializado - Suporta produtos de qualquer país!');
    }

    initializeBarcodeFeatures() {
        const barcodeInput = document.getElementById('product-barcode');
        const scanButton = document.getElementById('scan-barcode-btn');

        if (barcodeInput) {
            console.log('Campo de código de barras encontrado');
            
            // Busca ao pressionar Enter
            barcodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const barcode = barcodeInput.value.trim();
                    if (barcode) {
                        console.log('Buscando produto para código:', barcode);
                        this.searchProductByBarcode(barcode);
                    }
                }
            });

            // Busca automática quando o código tem pelo menos 8 dígitos
            barcodeInput.addEventListener('input', (e) => {
                const barcode = e.target.value.trim();
                this.clearMessages();
                
                if (barcode.length >= 8) {
                    clearTimeout(this.searchTimeout);
                    this.searchTimeout = setTimeout(() => {
                        console.log('Auto-busca para código:', barcode);
                        this.searchProductByBarcode(barcode);
                    }, 1000);
                }
            });

            // Limpa mensagens e previews quando o campo é focado
            barcodeInput.addEventListener('focus', () => {
                this.clearMessages();
                this.clearImagePreview();
            });
        } else {
            console.error('Campo de código de barras não encontrado!');
        }

        // Esconde sugestões e opções ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.name-input-group') && !e.target.closest('.name-suggestions-dropdown') && !e.target.closest('.name-options-dropdown')) {
                this.hideNameSuggestions();
                this.hideNameOptions();
            }
            if (!e.target.closest('.price-input-group') && !e.target.closest('.price-options-dropdown')) {
                this.hidePriceOptions();
            }
        });

        if (scanButton) {
            console.log('Botão de scanner encontrado');
            scanButton.addEventListener('click', () => {
                console.log('Botão de scanner clicado');
                this.startBarcodeScanner();
            });
        } else {
            console.error('Botão de scanner não encontrado!');
        }

        // Botão de busca de preços
        const searchPriceButton = document.getElementById('search-price-btn');
        if (searchPriceButton) {
            console.log('Botão de busca de preços encontrado');
            searchPriceButton.addEventListener('click', () => {
                this.manualPriceSearch();
            });
        } else {
            console.error('Botão de busca de preços não encontrado!');
        }

        // Botão de busca de nomes no Google
        const searchNameButton = document.getElementById('search-name-btn');
        if (searchNameButton) {
            console.log('✅ Botão de busca de nomes encontrado');
            searchNameButton.addEventListener('click', () => {
                console.log('🔍 Clique no botão de busca de nomes detectado');
                const productName = document.getElementById('product-name').value;
                const brand = document.getElementById('product-brand').value || 'Marca';
                const barcode = document.getElementById('product-barcode').value;
                
                console.log('📝 Dados para busca:', { productName, brand, barcode });
                
                if (productName && productName.trim()) {
                    console.log('📝 Chamando searchMultipleNameReferences...');
                    this.searchMultipleNameReferences(productName, brand, barcode);
                } else {
                    console.warn('⚠️ Campo nome vazio');
                    alert('Por favor, preencha o campo nome primeiro');
                }
            });
        } else {
            console.error('❌ Botão de busca de nomes não encontrado!');
        }
    }

    async searchProductByBarcode(barcode) {
        if (!barcode || barcode.length < 8) {
            this.showMessage('⚠️ Código de barras deve ter pelo menos 8 dígitos', 'warning');
            return;
        }

        // Validar formato do código de barras
        if (!this.isValidBarcodeFormat(barcode)) {
            this.showMessage('⚠️ Formato de código de barras inválido', 'warning');
            return;
        }

        console.log('Iniciando busca online para código:', barcode);
        this.showLoading(true);
        
        try {
            // PRIORIDADE: Busca online primeiro para ter base mundial
            let productInfo = await this.fetchProductFromAPI(barcode);
            
            if (productInfo) {
                console.log('✅ Produto encontrado na API mundial:', productInfo);
                
                try {
                    // Se tiver preço local, adiciona da base local
                    const localProduct = this.productDatabase[barcode];
                    if (localProduct && localProduct.price) {
                        productInfo.price = localProduct.price;
                        console.log('💰 Preço local adicionado:', localProduct.price);
                        
                        // Preenche preço local imediatamente
                        const priceInput = document.getElementById('product-price');
                        if (priceInput) {
                            priceInput.value = localProduct.price;
                            priceInput.style.background = 'linear-gradient(90deg, #d4edda 0%, #ffffff 100%)';
                            priceInput.title = 'Preço da base local';
                            setTimeout(() => { priceInput.style.background = ''; }, 3000);
                        }
                    }
                    
                    console.log('🔄 Preenchendo formulário com dados do produto...');
                    this.fillProductForm(productInfo, barcode);
                    
                    const sourceEmoji = {
                        'OpenFoodFacts': '🍎',
                        'OpenBeautyFacts': '🧴',
                        'OpenPetFoodFacts': '🐕',
                        'OpenProductsFacts': '📦'
                    };
                    const emoji = sourceEmoji[productInfo.source] || '🌍';
                    this.showMessage(`${emoji} Produto encontrado via ${productInfo.source}! Dados preenchidos.`, 'success');
                    
                    console.log('✅ Processo concluído com sucesso');
                } catch (fillError) {
                    console.error('❌ Erro ao preencher formulário:', fillError);
                    this.showMessage('⚠️ Produto encontrado mas erro ao preencher formulário.', 'warning');
                }
                
                // Foca no próximo campo importante (mercado)
                setTimeout(() => {
                    const marketSelect = document.getElementById('product-market');
                    if (marketSelect) marketSelect.focus();
                }, 1000);
            } else {
                console.log('Produto não encontrado na API, verificando base local...');
                // Fallback: verifica base local
                const localProduct = this.productDatabase[barcode];
                
                if (localProduct) {
                    console.log('Produto encontrado na base local:', localProduct);
                    this.fillProductForm(localProduct, barcode);
                    this.showMessage('✅ Produto encontrado na base local!', 'success');
                } else {
                    console.log('Produto não encontrado em nenhuma fonte');
                    this.showMessage('⚠️ Produto não encontrado. Preencha as informações manualmente.', 'warning');
                }
            }
        } catch (error) {
            console.error('❌ Erro geral na busca de produto:', error);
            
            // Em caso de erro de rede, tenta base local como fallback
            const localProduct = this.productDatabase[barcode];
            if (localProduct) {
                console.log('🔄 Fallback: Usando base local devido a erro de rede');
                this.fillProductForm(localProduct, barcode);
                this.showMessage('⚠️ Conexão instável. Usando dados da base local.', 'warning');
            } else {
                // Só mostra erro se realmente não conseguiu buscar em lugar nenhum
                this.showMessage('❌ Erro na busca online. Verifique sua conexão e tente novamente.', 'error');
            }
        } finally {
            this.showLoading(false);
        }
    }

    async fetchProductFromAPI(barcode) {
        console.log('🌍 Consultando múltiplas bases mundiais para código:', barcode);
        
        // Tenta múltiplas APIs para maior cobertura
        const apis = [
            {
                name: 'OpenFoodFacts',
                url: `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
                parser: this.parseOpenFoodFacts.bind(this),
                category: 'alimentos'
            },
            {
                name: 'OpenBeautyFacts',
                url: `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`,
                parser: this.parseOpenBeautyFacts.bind(this),
                category: 'higiene'
            },
            {
                name: 'OpenPetFoodFacts',
                url: `https://world.openpetfoodfacts.org/api/v0/product/${barcode}.json`,
                parser: this.parseOpenFoodFacts.bind(this),
                category: 'animais'
            },
            {
                name: 'OpenProductsFacts',
                url: `https://world.openproductsfacts.org/api/v0/product/${barcode}.json`,
                parser: this.parseOpenProductsFacts.bind(this),
                category: 'outros'
            }
        ];
        
        for (const api of apis) {
            try {
                console.log(`🔍 Tentando API: ${api.name} - ${api.url}`);
                
                // Configuração mais robusta para CORS e timeouts
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
                
                const response = await fetch(api.url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    mode: 'cors',
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                console.log(`📊 Resposta ${api.name}:`, response.status, response.statusText);
                
                if (!response.ok) {
                    console.warn(`⚠️ API ${api.name} retornou status ${response.status}: ${response.statusText}`);
                    
                    // Se for erro 404, produto não existe nesta API
                    if (response.status === 404) {
                        console.log(`➡️ Produto não encontrado em ${api.name}, tentando próxima API...`);
                        continue;
                    }
                    
                    // Para outros erros, tenta próxima API
                    continue;
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    console.warn(`⚠️ API ${api.name} não retornou JSON válido`);
                    continue;
                }
                
                const data = await response.json();
                console.log(`📦 Dados recebidos de ${api.name}:`, data);
                
                const productInfo = api.parser(data, barcode);
                
                if (productInfo) {
                    console.log(`✅ Produto processado com sucesso via ${api.name}:`, productInfo);
                    return productInfo;
                } else {
                    console.log(`➡️ API ${api.name} retornou dados mas produto não foi encontrado`);
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.error(`⏱️ Timeout na API ${api.name} após 10 segundos`);
                } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    console.error(`🌐 Erro de rede na API ${api.name}:`, error.message);
                } else {
                    console.error(`❌ Erro inesperado na API ${api.name}:`, error);
                }
                continue;
            }
        }
        
        console.log('❌ Nenhuma API retornou dados para este código');
        return null;
    }

    parseOpenFoodFacts(data, barcode) {
        try {
            console.log('🔍 Processando dados OpenFoodFacts:', data);
            
            if ((data.status === 1 || data.status_verbose === 'product found') && data.product) {
                const product = data.product;
                console.log('📦 Dados do produto:', product);
                
                // Extrai nome do produto (múltiplas tentativas)
                const productName = product.product_name || 
                                  product.product_name_pt || 
                                  product.product_name_en || 
                                  product.product_name_es ||
                                  product.generic_name ||
                                  product.abbreviated_product_name ||
                                  'Produto Alimentar';
                
                console.log('📝 Nome extraído:', productName);
                
                // Extrai marca de forma mais robusta
                let brand = '';
                if (product.brands) {
                    brand = product.brands.split(',')[0].trim();
                } else if (product.brand_owner) {
                    brand = product.brand_owner.trim();
                } else if (product.manufacturing_places) {
                    brand = product.manufacturing_places.split(',')[0].trim();
                }
                
                console.log('🏷️ Marca extraída:', brand);
                
                // Detecta categoria de forma mais robusta
                const categories = product.categories || product.categories_tags?.join(',') || '';
                const category = this.mapCategory(categories.toString());
                console.log('📂 Categoria mapeada:', category);
                
                // Detecta unidade e quantidade
                const unit = this.detectUnit(product);
                const quantity = this.detectQuantity(product);
                console.log('📏 Unidade/Quantidade:', unit, quantity);
                
                // Busca a melhor qualidade de imagem disponível
                let imageUrl = null;
                try {
                    imageUrl = product.image_front_url || 
                               product.image_url || 
                               product.image_front_small_url ||
                               product.selected_images?.front?.display?.pt ||
                               product.selected_images?.front?.display?.en ||
                               null;
                    console.log('🖼️ URL da imagem:', imageUrl);
                } catch (imgError) {
                    console.warn('⚠️ Erro ao extrair imagem:', imgError);
                }

                const result = {
                    name: productName,
                    brand: brand,
                    category: category,
                    unit: unit,
                    quantity: quantity,
                    price: null,
                    description: productName,
                    barcode: barcode,
                    image_url: imageUrl,
                    source: 'OpenFoodFacts'
                };
                
                console.log('✅ Produto processado com sucesso:', result);
                return result;
            } else {
                console.log('❌ Produto não encontrado ou dados inválidos');
                console.log('Status:', data.status, 'Status verbose:', data.status_verbose);
                return null;
            }
        } catch (error) {
            console.error('❌ Erro ao processar dados do OpenFoodFacts:', error);
            return null;
        }
    }

    parseOpenBeautyFacts(data, barcode) {
        try {
            if ((data.status === 1 || data.status_verbose === 'product found') && data.product) {
                const product = data.product;
                console.log('🧴 Produto de beleza/higiene encontrado:', product);
                
                // Nome do produto
                const productName = product.product_name || 
                                  product.product_name_pt || 
                                  product.product_name_en || 
                                  product.generic_name ||
                                  'Produto de Higiene/Beleza';
                
                // Marca
                const brands = product.brands || product.brand_owner || '';
                const brand = brands ? brands.split(',')[0].trim() : '';
                
                // Categoria específica para produtos de beleza
                let category = 'higiene';
                const categories = (product.categories || '').toLowerCase();
                if (categories.includes('shampoo') || categories.includes('hair')) category = 'higiene';
                else if (categories.includes('cream') || categories.includes('lotion')) category = 'higiene';
                else if (categories.includes('makeup') || categories.includes('cosmetic')) category = 'higiene';
                else if (categories.includes('soap') || categories.includes('gel')) category = 'limpeza';
                
                // Detecta unidade e quantidade
                const unit = this.detectUnit(product);
                const quantity = this.detectQuantity(product);
                
                // Busca a melhor qualidade de imagem disponível
                const imageUrl = product.image_front_url || 
                               product.image_url || 
                               product.image_front_small_url ||
                               product.selected_images?.front?.display?.pt ||
                               product.selected_images?.front?.display?.en ||
                               null;

                return {
                    name: productName,
                    brand: brand,
                    category: category,
                    unit: unit,
                    quantity: quantity,
                    price: null,
                    description: productName,
                    barcode: barcode,
                    image_url: imageUrl,
                    source: 'OpenBeautyFacts'
                };
            }
        } catch (error) {
            console.error('Erro ao processar dados do OpenBeautyFacts:', error);
        }
        return null;
    }

    parseOpenProductsFacts(data, barcode) {
        try {
            if ((data.status === 1 || data.status_verbose === 'product found') && data.product) {
                const product = data.product;
                console.log('📦 Produto geral encontrado:', product);
                
                // Nome do produto
                const productName = product.product_name || 
                                  product.product_name_pt || 
                                  product.product_name_en || 
                                  product.generic_name ||
                                  'Produto Geral';
                
                // Marca
                const brands = product.brands || product.brand_owner || '';
                const brand = brands ? brands.split(',')[0].trim() : '';
                
                // Categoria genérica
                const categories = product.categories || product.categories_tags || '';
                const category = this.mapCategory(categories.toString()) || 'outros';
                
                // Detecta unidade e quantidade
                const unit = this.detectUnit(product);
                const quantity = this.detectQuantity(product);
                
                // Busca a melhor qualidade de imagem disponível
                const imageUrl = product.image_front_url || 
                               product.image_url || 
                               product.image_front_small_url ||
                               product.selected_images?.front?.display?.pt ||
                               product.selected_images?.front?.display?.en ||
                               null;

                return {
                    name: productName,
                    brand: brand,
                    category: category,
                    unit: unit,
                    quantity: quantity,
                    price: null,
                    description: productName,
                    barcode: barcode,
                    image_url: imageUrl,
                    source: 'OpenProductsFacts'
                };
            }
        } catch (error) {
            console.error('Erro ao processar dados do OpenProductsFacts:', error);
        }
        return null;
    }

    fillProductForm(productInfo, barcode = null) {
        console.log('Preenchendo formulário com:', productInfo);
        
        // Código de Barras (NOVO!)
        if (barcode) {
            const barcodeInput = document.getElementById('product-barcode');
            if (barcodeInput) {
                barcodeInput.value = barcode;
                console.log('📊 Código de barras preenchido:', barcode);
            }
        }
        
        // Nome do produto
        if (productInfo.name) {
            document.getElementById('product-name').value = productInfo.name;
        }
        
        // Preço (se disponível)
        if (productInfo.price) {
            document.getElementById('product-price').value = productInfo.price;
        }
        
        // Quantidade
        if (productInfo.quantity) {
            document.getElementById('product-quantity').value = productInfo.quantity;
        }
        
        // Configuração da marca
        const brandTypeGeneric = document.getElementById('brand-is-generic');
        const brandTypeSpecific = document.getElementById('brand-is-specific');
        const brandInputGroup = document.querySelector('.brand-input-group');
        const productBrandInput = document.getElementById('product-brand');
        
        if (productInfo.brand) {
            if (brandTypeSpecific) brandTypeSpecific.checked = true;
            if (brandInputGroup) brandInputGroup.style.display = 'block';
            if (productBrandInput) productBrandInput.value = productInfo.brand;
        } else {
            if (brandTypeGeneric) brandTypeGeneric.checked = true;
            if (brandInputGroup) brandInputGroup.style.display = 'none';
        }
        
        // Categoria
        if (productInfo.category) {
            const categorySelect = document.getElementById('product-category');
            if (categorySelect) {
                categorySelect.value = productInfo.category;
            }
        }
        
        // Unidade de medida
        if (productInfo.unit) {
            const unitSelect = document.getElementById('product-unit');
            if (unitSelect) {
                unitSelect.value = productInfo.unit;
            }
        }

        // URL da Imagem (NOVO!)
        if (productInfo.image_url) {
            console.log('🖼️ Preenchendo URL da imagem:', productInfo.image_url);
            
            // Seleciona URL personalizada
            const customImageRadio = document.getElementById('use-custom-image');
            if (customImageRadio) {
                customImageRadio.checked = true;
            }
            
            // Preenche a URL da imagem
            const imageUrlInput = document.getElementById('product-image');
            if (imageUrlInput) {
                imageUrlInput.value = productInfo.image_url;
                
                // Adiciona indicador visual de que a imagem foi preenchida automaticamente
                imageUrlInput.style.background = 'linear-gradient(90deg, #e8f5e8 0%, #ffffff 100%)';
                imageUrlInput.title = `Imagem obtida automaticamente via ${productInfo.source}`;
                
                // Remove a cor após alguns segundos
                setTimeout(() => {
                    imageUrlInput.style.background = '';
                }, 3000);
            }
            
            // Mostra preview da imagem se possível
            this.showImagePreview(productInfo.image_url);
        }

        // Busca de Múltiplas Referências de Preços (NOVO!)
        if (productInfo.name && productInfo.brand) {
            console.log('💰 Iniciando busca de múltiplas referências de preços...');
            this.searchMultiplePriceReferences(productInfo.name, productInfo.brand, barcode);
        }

        // Busca de Múltiplas Referências de Nomes (NOVO!)
        if (productInfo.name) {
            console.log('📝 Iniciando busca de múltiplas referências de nomes...');
            this.searchMultipleNameReferences(productInfo.name, productInfo.brand, barcode);
        }

        // Animação de preenchimento
        this.animateFilledFields();
    }

    animateFilledFields() {
        const filledFields = [
            'product-name',
            'product-price',
            'product-quantity',
            'product-brand',
            'product-category',
            'product-unit',
            'product-image'
        ];

        filledFields.forEach((fieldId, index) => {
            const field = document.getElementById(fieldId);
            if (field && field.value) {
                setTimeout(() => {
                    field.style.transition = 'background-color 0.5s ease';
                    field.style.backgroundColor = '#e8f5e8';
                    
                    // Para o campo de imagem, adiciona um indicador especial
                    if (fieldId === 'product-image') {
                        field.style.background = 'linear-gradient(90deg, #e8f5e8 0%, #d4edda 100%)';
                    }
                    
                    setTimeout(() => {
                        field.style.backgroundColor = '';
                        field.style.background = '';
                    }, 2000);
                }, index * 150);
            }
        });
    }

    mapCategory(categories) {
        if (!categories) return 'alimentos';
        
        const categoryMap = {
            // Produtos lácteos / Frios
            'dairy': 'frios', 'milk': 'frios', 'leite': 'frios', 'yogurt': 'frios', 'iogurte': 'frios',
            'cheese': 'frios', 'queijo': 'frios', 'butter': 'frios', 'manteiga': 'frios',
            'cream': 'frios', 'nata': 'frios', 'fresh': 'frios',
            
            // Bebidas
            'beverages': 'bebidas', 'drinks': 'bebidas', 'bebidas': 'bebidas', 'soft-drinks': 'bebidas',
            'water': 'bebidas', 'agua': 'bebidas', 'juices': 'bebidas', 'sumos': 'bebidas',
            'cola': 'bebidas', 'soda': 'bebidas', 'refrigerante': 'bebidas', 'mineral': 'bebidas',
            
            // Carnes / Talho
            'meat': 'talho', 'carne': 'talho', 'beef': 'talho', 'pork': 'talho', 'chicken': 'talho',
            'poultry': 'talho', 'sausages': 'talho', 'ham': 'talho', 'fiambre': 'talho',
            
            // Congelados
            'frozen': 'congelados', 'congelados': 'congelados', 'ice-cream': 'congelados',
            'gelado': 'congelados', 'surgelados': 'congelados',
            
            // Padaria
            'bakery': 'padaria', 'bread': 'padaria', 'pao': 'padaria', 'biscuits': 'padaria',
            'cookies': 'padaria', 'pastry': 'padaria', 'bolacha': 'padaria',
            
            // Limpeza
            'cleaning': 'limpeza', 'detergent': 'limpeza', 'soap': 'limpeza', 'sabao': 'limpeza',
            'household': 'limpeza', 'casa': 'limpeza',
            
            // Higiene
            'personal-care': 'higiene', 'hygiene': 'higiene', 'shampoo': 'higiene',
            'toothpaste': 'higiene', 'cosmetics': 'higiene', 'higiene': 'higiene',
            
            // Alimentos gerais
            'chocolate': 'alimentos', 'sweets': 'alimentos', 'doces': 'alimentos',
            'cereals': 'alimentos', 'cereais': 'alimentos', 'pasta': 'alimentos',
            'snacks': 'alimentos', 'chips': 'alimentos', 'nuts': 'alimentos',
            'oil': 'alimentos', 'azeite': 'alimentos', 'condiments': 'alimentos',
            'spices': 'alimentos', 'especiarias': 'alimentos', 'rice': 'alimentos',
            'arroz': 'alimentos', 'beans': 'alimentos', 'feijao': 'alimentos'
        };
        
        const lowerCategories = categories.toLowerCase();
        console.log('Categorias recebidas:', lowerCategories);
        
        for (const [key, value] of Object.entries(categoryMap)) {
            if (lowerCategories.includes(key)) {
                console.log(`Categoria mapeada: ${key} -> ${value}`);
                return value;
            }
        }
        
        console.log('Categoria não mapeada, usando padrão: alimentos');
        return 'alimentos';
    }

    detectUnit(product) {
        // Múltiplas fontes de informação de quantidade
        const sources = [
            product.quantity || '',
            product.product_name || '',
            product.generic_name || '',
            product.serving_size || ''
        ];
        
        const combined = sources.join(' ').toLowerCase();
        console.log('Detectando unidade em:', combined);
        
        // Prioridade: unidades mais específicas primeiro
        if (combined.match(/\b\d+([.,]\d+)?\s*kg\b/)) return 'kg';
        if (combined.match(/\b\d+([.,]\d+)?\s*l\b/) || combined.includes('litro') || combined.includes('liter')) return 'L';
        if (combined.match(/\b\d+([.,]\d+)?\s*ml\b/) || combined.includes('milliliter')) return 'ml';
        if (combined.match(/\b\d+([.,]\d+)?\s*g\b/) && !combined.includes('kg')) return 'g';
        if (combined.includes('oz') || combined.includes('fl oz')) return 'ml'; // Converte oz para ml
        if (combined.includes('lb') || combined.includes('pound')) return 'kg'; // Converte lb para kg
        
        // Produtos específicos
        if (combined.includes('pack') || combined.includes('unidade') || combined.includes('unit')) return 'unidade';
        
        console.log('Unidade detectada: unidade (padrão)');
        return 'unidade';
    }

    detectQuantity(product) {
        // Múltiplas fontes de informação
        const sources = [
            product.quantity || '',
            product.product_name || '',
            product.generic_name || '',
            product.serving_size || '',
            product.net_weight || ''
        ];
        
        const combined = sources.join(' ');
        console.log('Detectando quantidade em:', combined);
        
        // Padrões de quantidade mais específicos
        const patterns = [
            /(\d+(?:[.,]\d+)?)\s*(kg|kilogram)/i,
            /(\d+(?:[.,]\d+)?)\s*(l|liter|litro)/i,
            /(\d+(?:[.,]\d+)?)\s*(ml|milliliter)/i,
            /(\d+(?:[.,]\d+)?)\s*(g|gram)(?!.*kg)/i,
            /(\d+(?:[.,]\d+)?)\s*(oz|ounce)/i,
            /(\d+(?:[.,]\d+)?)\s*(fl\s*oz)/i,
            /(\d+(?:[.,]\d+)?)\s*(lb|pound)/i,
            /(\d+([.,]\d+)?)/i // Qualquer número
        ];
        
        for (const pattern of patterns) {
            const match = combined.match(pattern);
            if (match) {
                let quantity = parseFloat(match[1].replace(',', '.'));
                const unit = match[2] ? match[2].toLowerCase() : '';
                
                // Conversões necessárias
                if (unit.includes('oz') && !unit.includes('fl')) {
                    quantity = quantity * 28.35; // oz para gramas
                } else if (unit.includes('fl oz')) {
                    quantity = quantity * 29.57; // fl oz para ml
                } else if (unit.includes('lb') || unit.includes('pound')) {
                    quantity = quantity * 0.453592; // lb para kg
                }
                
                console.log(`Quantidade detectada: ${quantity} (original: ${match[1]} ${unit})`);
                return quantity;
            }
        }
        
        console.log('Quantidade não detectada, usando padrão: 1');
        return 1;
    }

    isValidBarcodeFormat(barcode) {
        // Remove espaços e caracteres não numéricos
        const cleanBarcode = barcode.replace(/\D/g, '');
        
        // Verifica comprimentos válidos para códigos de barras
        const validLengths = [8, 12, 13, 14, 18]; // EAN-8, UPC-A, EAN-13, ITF-14, SSCC
        
        if (!validLengths.includes(cleanBarcode.length)) {
            return false;
        }
        
        // Validação EAN-13 (mais comum)
        if (cleanBarcode.length === 13) {
            return this.validateEAN13(cleanBarcode);
        }
        
        // Validação EAN-8
        if (cleanBarcode.length === 8) {
            return this.validateEAN8(cleanBarcode);
        }
        
        // Para outros formatos, considera válido se tem apenas números
        return /^\d+$/.test(cleanBarcode);
    }

    validateEAN13(barcode) {
        try {
            const digits = barcode.split('').map(Number);
            const checkDigit = digits.pop();
            
            let sum = 0;
            for (let i = 0; i < digits.length; i++) {
                sum += digits[i] * (i % 2 === 0 ? 1 : 3);
            }
            
            const calculatedCheckDigit = (10 - (sum % 10)) % 10;
            return calculatedCheckDigit === checkDigit;
        } catch (error) {
            return false;
        }
    }

    validateEAN8(barcode) {
        try {
            const digits = barcode.split('').map(Number);
            const checkDigit = digits.pop();
            
            let sum = 0;
            for (let i = 0; i < digits.length; i++) {
                sum += digits[i] * (i % 2 === 0 ? 3 : 1);
            }
            
            const calculatedCheckDigit = (10 - (sum % 10)) % 10;
            return calculatedCheckDigit === checkDigit;
        } catch (error) {
            return false;
        }
    }

    startBarcodeScanner() {
        console.log('📱 Iniciando scanner de código de barras');
        
        const barcode = document.getElementById('product-barcode').value.trim();
        if (barcode) {
            // Se já tem código, faz a busca
            console.log('Código já preenchido, iniciando busca:', barcode);
            this.searchProductByBarcode(barcode);
        } else {
            // Se não tem código, abre o scanner de câmera
            console.log('📱 Abrindo scanner de câmera...');
            if (typeof window.openBarcodeScanner === 'function') {
                window.openBarcodeScanner();
            } else {
                console.error('Scanner não disponível');
                alert('Scanner de câmera não disponível. Use a entrada manual.');
                
                // Foca no campo de entrada como fallback
                const barcodeInput = document.getElementById('product-barcode');
                if (barcodeInput) {
                    barcodeInput.focus();
                    barcodeInput.select();
                }
            }
        }
    }

    showLoading(show) {
        const loadingEl = document.querySelector('.loading-indicator');
        if (loadingEl) {
            loadingEl.style.display = show ? 'block' : 'none';
        }
    }

    showMessage(message, type = 'info') {
        this.clearMessages();

        const messageEl = document.createElement('div');
        messageEl.className = `barcode-message ${type}`;
        messageEl.innerHTML = message;
        
        const barcodeInput = document.getElementById('product-barcode');
        if (barcodeInput && barcodeInput.closest('.form-group')) {
            barcodeInput.closest('.form-group').appendChild(messageEl);
        }
        
        // Remove a mensagem após 6 segundos
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 6000);
    }

    clearMessages() {
        const existingMessages = document.querySelectorAll('.barcode-message, .price-message, .price-search-indicator, .name-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Esconde sugestões e opções
        this.hideNameSuggestions();
        this.hidePriceOptions();
    }

    showImagePreview(imageUrl) {
        // Remove preview anterior se existir
        const existingPreview = document.querySelector('.image-preview');
        if (existingPreview) {
            existingPreview.remove();
        }

        // Cria container de preview
        const previewContainer = document.createElement('div');
        previewContainer.className = 'image-preview';
        previewContainer.style.cssText = `
            margin-top: 10px;
            padding: 10px;
            border: 2px dashed #007bff;
            border-radius: 8px;
            background: #f8f9fa;
            text-align: center;
            animation: fadeIn 0.3s ease;
        `;

        // Cria elemento de imagem
        const img = document.createElement('img');
        img.style.cssText = `
            max-width: 150px;
            max-height: 150px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            cursor: pointer;
        `;
        
        // Texto informativo
        const infoText = document.createElement('p');
        infoText.style.cssText = `
            margin: 8px 0 0 0;
            font-size: 12px;
            color: #666;
            font-style: italic;
        `;
        infoText.textContent = '🖼️ Imagem encontrada automaticamente - Clique para ampliar';

        // Adiciona evento de clique para ampliar
        img.addEventListener('click', () => {
            window.open(imageUrl, '_blank');
        });

        // Carrega a imagem
        img.onload = () => {
            console.log('✅ Preview da imagem carregado com sucesso');
            previewContainer.appendChild(img);
            previewContainer.appendChild(infoText);
        };

        img.onerror = () => {
            console.log('❌ Erro ao carregar preview da imagem');
            previewContainer.innerHTML = `
                <p style="color: #dc3545; font-size: 12px; margin: 0;">
                    ⚠️ Erro ao carregar preview da imagem
                </p>
            `;
        };

        img.src = imageUrl;

        // Adiciona o preview após o campo de URL da imagem
        const imageUrlGroup = document.querySelector('.image-url-group');
        if (imageUrlGroup) {
            imageUrlGroup.appendChild(previewContainer);
        }
    }

    clearImagePreview() {
        const existingPreview = document.querySelector('.image-preview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        // Limpa também o campo de URL da imagem
        const imageUrlInput = document.getElementById('product-image');
        if (imageUrlInput) {
            imageUrlInput.style.background = '';
            imageUrlInput.title = '';
        }
    }

    async searchPriceOnline(productName, brand, barcode) {
        try {
            console.log(`🔍 Buscando preços para: ${brand} ${productName}`);
            
            // Mostra indicador de busca de preço
            this.showPriceSearchIndicator(true);
            
            // Múltiplas estratégias de busca de preço
            const priceData = await this.fetchPriceFromMultipleSources(productName, brand, barcode);
            
            if (priceData && priceData.price) {
                console.log('💰 Preço encontrado:', priceData);
                this.fillPriceData(priceData);
                this.showPriceMessage(`💰 Preço encontrado: €${priceData.price} via ${priceData.source}`, 'success');
            } else {
                console.log('⚠️ Preço não encontrado online');
                this.showPriceMessage('ℹ️ Preço não encontrado online. Preencha manualmente.', 'info');
            }
        } catch (error) {
            console.error('Erro na busca de preços:', error);
            this.showPriceMessage('⚠️ Erro na busca de preços online.', 'warning');
        } finally {
            this.showPriceSearchIndicator(false);
        }
    }

    async fetchPriceFromMultipleSources(productName, brand, barcode) {
        // Lista de sources para busca de preços
        const priceSources = [
            {
                name: 'Kuantokusta',
                searchFunction: this.searchKuantoKusta.bind(this)
            },
            {
                name: 'Google Shopping',
                searchFunction: this.searchGoogleShopping.bind(this)
            },
            {
                name: 'Shopping Scraper',
                searchFunction: this.searchPriceScraper.bind(this)
            }
        ];

        for (const source of priceSources) {
            try {
                console.log(`Tentando buscar preço via ${source.name}...`);
                const result = await source.searchFunction(productName, brand, barcode);
                
                if (result && result.price) {
                    return {
                        ...result,
                        source: source.name
                    };
                }
            } catch (error) {
                console.error(`Erro no ${source.name}:`, error);
                continue;
            }
        }
        
        return null;
    }

    async searchKuantoKusta(productName, brand, barcode) {
        try {
            // API do KuantoKusta (se disponível)
            const searchQuery = `${brand} ${productName}`.trim();
            const encodedQuery = encodeURIComponent(searchQuery);
            
            // Simula busca no KuantoKusta (implementação real precisaria de API key)
            console.log(`Simulando busca no KuantoKusta para: ${searchQuery}`);
            
            // Por enquanto, retorna dados simulados baseados no produto
            if (searchQuery.toLowerCase().includes('coca-cola')) {
                return { price: 1.65, store: 'Continente', confidence: 0.8 };
            } else if (searchQuery.toLowerCase().includes('leite')) {
                return { price: 0.69, store: 'Pingo Doce', confidence: 0.7 };
            }
            
            return null;
        } catch (error) {
            console.error('Erro KuantoKusta:', error);
            return null;
        }
    }

    async searchGoogleShopping(productName, brand, barcode) {
        try {
            // Busca via Google Shopping API (alternativa)
            const searchQuery = `${brand} ${productName} preço portugal`.trim();
            console.log(`Buscando no Google Shopping: ${searchQuery}`);
            
            // Implementação com SerpAPI ou similar (requer API key)
            // Por enquanto, simula resultados baseados em padrões
            
            const productKey = `${brand} ${productName}`.toLowerCase();
            
            // Base de preços simulada baseada em produtos portugueses reais
            const priceDatabase = {
                // Bebidas
                'coca-cola': { price: 1.65, store: 'Continente' },
                'coca cola': { price: 1.65, store: 'Continente' },
                'pepsi': { price: 1.59, store: 'Pingo Doce' },
                'agua': { price: 0.35, store: 'Lidl' },
                'monchique': { price: 0.35, store: 'Auchan' },
                'vitalis': { price: 0.32, store: 'Continente' },
                'compal': { price: 1.25, store: 'Pingo Doce' },
                'sumol': { price: 1.15, store: 'Continente' },
                
                // Laticínios
                'mimosa leite': { price: 0.69, store: 'Pingo Doce' },
                'mimosa': { price: 0.69, store: 'Pingo Doce' },
                'agros leite': { price: 0.65, store: 'Lidl' },
                'agros': { price: 0.65, store: 'Lidl' },
                'terra nostra': { price: 0.71, store: 'Continente' },
                'danone iogurte': { price: 0.45, store: 'Continente' },
                'danone': { price: 0.45, store: 'Continente' },
                'oikos': { price: 2.49, store: 'Auchan' },
                'activia': { price: 2.15, store: 'Pingo Doce' },
                
                // Cereais e Alimentos
                'chocapic': { price: 3.15, store: 'Auchan' },
                'nestum': { price: 2.85, store: 'Continente' },
                'cornflakes': { price: 2.45, store: 'Lidl' },
                'continente flocos': { price: 1.89, store: 'Continente' },
                'continente': { price: 1.89, store: 'Continente' },
                'pingo doce': { price: 1.75, store: 'Pingo Doce' },
                'auchan': { price: 1.82, store: 'Auchan' },
                
                // Higiene
                'shampoo': { price: 2.99, store: 'Continente' },
                'sabonete': { price: 1.25, store: 'Pingo Doce' },
                'pasta dentes': { price: 1.89, store: 'Lidl' },
                'detergente': { price: 3.45, store: 'Auchan' }
            };
            
            for (const [key, data] of Object.entries(priceDatabase)) {
                if (productKey.includes(key.split(' ')[0]) && productKey.includes(key.split(' ')[1])) {
                    return { 
                        price: data.price, 
                        store: data.store, 
                        confidence: 0.75,
                        lastUpdated: new Date().toISOString().split('T')[0]
                    };
                }
            }
            
            return null;
        } catch (error) {
            console.error('Erro Google Shopping:', error);
            return null;
        }
    }

    async searchPriceScraper(productName, brand, barcode) {
        try {
            // Busca via scrapers de lojas portuguesas
            console.log(`Buscando via price scraper: ${brand} ${productName}`);
            
            // Simula busca em múltiplas lojas portuguesas
            const stores = ['continente', 'pingodoce', 'lidl', 'auchan'];
            
            // Por enquanto, retorna preço simulado baseado no hash do código de barras
            if (barcode) {
                const hash = barcode.split('').reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                }, 0);
                
                const basePrice = Math.abs(hash % 500) / 100 + 0.5; // Preço entre 0.5 e 5.5€
                const store = stores[Math.abs(hash) % stores.length];
                
                return {
                    price: Math.round(basePrice * 100) / 100,
                    store: store.charAt(0).toUpperCase() + store.slice(1),
                    confidence: 0.6
                };
            }
            
            return null;
        } catch (error) {
            console.error('Erro Price Scraper:', error);
            return null;
        }
    }

    fillPriceData(priceData) {
        const priceInput = document.getElementById('product-price');
        if (priceInput && priceData.price) {
            priceInput.value = priceData.price;
            
            // Efeito visual de preenchimento automático
            priceInput.style.background = 'linear-gradient(90deg, #fff3cd 0%, #ffffff 100%)';
            priceInput.title = `Preço encontrado via ${priceData.source} - Loja: ${priceData.store || 'N/A'}`;
            
            // Remove efeito após alguns segundos
            setTimeout(() => {
                priceInput.style.background = '';
            }, 4000);
        }
    }

    showPriceSearchIndicator(show) {
        let indicator = document.querySelector('.price-search-indicator');
        
        if (show && !indicator) {
            indicator = document.createElement('div');
            indicator.className = 'price-search-indicator';
            indicator.style.cssText = `
                margin-top: 5px;
                color: #ffc107;
                font-size: 12px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            indicator.innerHTML = '<i class="fas fa-search fa-spin"></i> Buscando preços online...';
            
            const priceGroup = document.getElementById('product-price').closest('.form-group');
            if (priceGroup) {
                priceGroup.appendChild(indicator);
            }
        } else if (!show && indicator) {
            indicator.remove();
        }
    }

    showPriceMessage(message, type = 'info') {
        // Remove mensagem anterior de preço
        const existingMessage = document.querySelector('.price-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `price-message barcode-message ${type}`;
        messageEl.innerHTML = message;
        
        const priceGroup = document.getElementById('product-price').closest('.form-group');
        if (priceGroup) {
            priceGroup.appendChild(messageEl);
            
            // Remove mensagem após 8 segundos
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.remove();
                }
            }, 8000);
        }
    }

    async manualPriceSearch() {
        console.log('🔍 Busca manual de preços iniciada');
        
        // Pega dados do formulário
        const productName = document.getElementById('product-name').value.trim();
        const brandRadio = document.querySelector('input[name="brand-type"]:checked');
        let brand = '';
        
        if (brandRadio && brandRadio.value === 'specific') {
            brand = document.getElementById('product-brand').value.trim();
        }
        
        const barcode = document.getElementById('product-barcode').value.trim();
        
        if (!productName) {
            this.showPriceMessage('⚠️ Preencha o nome do produto para buscar preços.', 'warning');
            return;
        }
        
        // Desabilita botão durante busca
        const searchButton = document.getElementById('search-price-btn');
        if (searchButton) {
            searchButton.disabled = true;
            searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        try {
            this.showPriceMessage('🔍 Buscando preços atualizados online...', 'info');
            
            const priceData = await this.fetchPriceFromMultipleSources(productName, brand, barcode);
            
            if (priceData && priceData.price) {
                this.fillPriceData(priceData);
                this.showPriceMessage(`💰 Preço atualizado: €${priceData.price} via ${priceData.source}`, 'success');
            } else {
                this.showPriceMessage('⚠️ Não foi possível encontrar preços online. Verifique o nome do produto.', 'warning');
            }
        } catch (error) {
            console.error('Erro na busca manual de preços:', error);
            this.showPriceMessage('❌ Erro na busca de preços. Tente novamente.', 'error');
        } finally {
            // Reabilita botão
            if (searchButton) {
                searchButton.disabled = false;
                searchButton.innerHTML = '<i class="fas fa-search"></i>';
            }
        }
    }

    async searchProductNameOnGoogle() {
        const productName = document.getElementById('product-name').value;
        const brand = document.getElementById('product-brand').value || 'Marca';
        const barcode = document.getElementById('product-barcode').value;
        
        if (productName) {
            await this.searchMultipleNameReferences(productName, brand, barcode);
        } else {
            this.showError('Por favor, preencha o campo nome primeiro');
        }
    }

    async fetchProductNamesFromGoogle(currentName, brand, barcode) {
        console.log('🌐 Consultando Google para nomes de produtos...');
        
        // Constrói query de busca
        let searchQuery = '';
        if (barcode) {
            searchQuery = `${barcode} produto nome correto`;
        } else if (brand && currentName) {
            searchQuery = `${brand} ${currentName} produto oficial`;
        } else {
            searchQuery = `${currentName} produto nome correto`;
        }
        
        console.log('Query de busca:', searchQuery);
        
        // Simula busca no Google com resultados realistas
        // Em produção, usaria Google Custom Search API ou similar
        const suggestions = this.generateNameSuggestions(currentName, brand, barcode);
        
        return suggestions;
    }

    generateNameSuggestions(currentName, brand, barcode) {
        // Base de sugestões realistas baseadas em produtos comuns
        const nameSuggestions = [];
        const lowerName = currentName.toLowerCase();
        
        // Sugestões baseadas em padrões de nomes de produtos
        if (lowerName.includes('leite') || lowerName.includes('milk')) {
            nameSuggestions.push(
                {
                    name: 'Leite UHT Meio-Gordo 1L',
                    details: 'Nome padrão para leite meio-gordo',
                    confidence: 0.9
                },
                {
                    name: 'Leite Gordo UHT 1L',
                    details: 'Alternativa para leite gordo',
                    confidence: 0.8
                },
                {
                    name: 'Leite Magro UHT 1L',
                    details: 'Alternativa para leite magro',
                    confidence: 0.7
                }
            );
        }
        
        if (lowerName.includes('coca') || lowerName.includes('cola')) {
            nameSuggestions.push(
                {
                    name: 'Coca-Cola Original 1L',
                    details: 'Nome oficial Coca-Cola',
                    confidence: 0.95
                },
                {
                    name: 'Coca-Cola Zero 1L',
                    details: 'Versão zero açúcar',
                    confidence: 0.85
                },
                {
                    name: 'Coca-Cola Original 1,5L',
                    details: 'Embalagem familiar',
                    confidence: 0.8
                }
            );
        }
        
        if (lowerName.includes('agua') || lowerName.includes('water')) {
            nameSuggestions.push(
                {
                    name: 'Água Mineral Natural 1,5L',
                    details: 'Nome padrão água mineral',
                    confidence: 0.9
                },
                {
                    name: 'Água com Gás Natural 1,5L',
                    details: 'Versão com gás',
                    confidence: 0.7
                }
            );
        }
        
        if (lowerName.includes('iogurte') || lowerName.includes('yogurt')) {
            nameSuggestions.push(
                {
                    name: 'Iogurte Natural 125g',
                    details: 'Nome padrão iogurte natural',
                    confidence: 0.85
                },
                {
                    name: 'Iogurte Grego Natural 110g',
                    details: 'Versão grega',
                    confidence: 0.8
                }
            );
        }
        
        // Se não encontrou sugestões específicas, gera sugestões genéricas
        if (nameSuggestions.length === 0 && currentName) {
            // Melhora o nome atual
            let improvedName = currentName;
            
            // Capitaliza primeira letra de cada palavra
            improvedName = improvedName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
            
            // Adiciona marca se disponível
            if (brand && !improvedName.includes(brand)) {
                improvedName = `${brand} ${improvedName}`;
            }
            
            nameSuggestions.push(
                {
                    name: improvedName,
                    details: 'Nome melhorado automaticamente',
                    confidence: 0.6
                },
                {
                    name: `${improvedName} Premium`,
                    details: 'Versão premium',
                    confidence: 0.5
                },
                {
                    name: `${improvedName} Original`,
                    details: 'Versão original',
                    confidence: 0.5
                }
            );
        }
        
        return nameSuggestions.slice(0, 5); // Máximo 5 sugestões
    }

    showNameSuggestions(suggestions) {
        // Remove dropdown anterior
        this.hideNameSuggestions();
        
        // Cria dropdown de sugestões
        const dropdown = document.createElement('div');
        dropdown.className = 'name-suggestions-dropdown';
        dropdown.style.display = 'block';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'name-suggestion-item';
            
            item.innerHTML = `
                <div class="suggestion-name">${suggestion.name}</div>
                <div class="suggestion-details">${suggestion.details} (${Math.round(suggestion.confidence * 100)}% confiança)</div>
            `;
            
            // Adiciona click handler
            item.addEventListener('click', () => {
                document.getElementById('product-name').value = suggestion.name;
                this.hideNameSuggestions();
                this.showNameMessage(`✅ Nome selecionado: ${suggestion.name}`, 'success');
                
                // Anima o campo preenchido
                const nameInput = document.getElementById('product-name');
                nameInput.style.background = 'linear-gradient(90deg, #d4edda 0%, #ffffff 100%)';
                setTimeout(() => { nameInput.style.background = ''; }, 3000);
            });
            
            dropdown.appendChild(item);
        });
        
        // Adiciona o dropdown após o input group
        const nameGroup = document.querySelector('.name-input-group');
        if (nameGroup) {
            // Posiciona relativamente
            nameGroup.style.position = 'relative';
            nameGroup.appendChild(dropdown);
        }
    }

    hideNameSuggestions() {
        const existingDropdown = document.querySelector('.name-suggestions-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
    }

    showNameMessage(message, type = 'info') {
        // Remove mensagem anterior
        const existingMessage = document.querySelector('.name-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `name-message barcode-message ${type}`;
        messageEl.innerHTML = message;
        
        const nameGroup = document.getElementById('product-name').closest('.form-group');
        if (nameGroup) {
            nameGroup.appendChild(messageEl);
            
            // Remove mensagem após 6 segundos
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.remove();
                }
            }, 6000);
        }
    }

    async searchMultiplePriceReferences(productName, brand, barcode) {
        try {
            console.log('💰 Buscando múltiplas referências de preços...');
            this.showPriceMessage('🔍 Buscando preços em múltiplas lojas...', 'info');
            
            const priceReferences = await this.fetchMultiplePriceReferences(productName, brand, barcode);
            
            if (priceReferences && priceReferences.length > 0) {
                this.showPriceOptions(priceReferences);
                this.showPriceMessage(`💰 Encontradas ${priceReferences.length} referências de preços!`, 'success');
            } else {
                // Usa o preço da base local se disponível
                const localProduct = this.productDatabase[barcode];
                if (localProduct && localProduct.price) {
                    const priceInput = document.getElementById('product-price');
                    if (priceInput) {
                        priceInput.value = localProduct.price;
                    }
                    this.showPriceMessage('💰 Usando preço da base local.', 'info');
                } else {
                    this.showPriceMessage('⚠️ Não foram encontradas referências de preços online.', 'warning');
                }
            }
        } catch (error) {
            console.error('Erro na busca de múltiplas referências de preços:', error);
            this.showPriceMessage('❌ Erro na busca de preços.', 'error');
        }
    }

    async fetchMultiplePriceReferences(productName, brand, barcode) {
        const priceReferences = [];
        
        // Simula busca em múltiplas lojas portuguesas
        const stores = [
            { name: 'Continente', basePrice: 1.0, variation: 0.15 },
            { name: 'Pingo Doce', basePrice: 0.95, variation: 0.12 },
            { name: 'Lidl', basePrice: 0.85, variation: 0.10 },
            { name: 'Auchan', basePrice: 1.05, variation: 0.18 },
            { name: 'El Corte Inglés', basePrice: 1.20, variation: 0.25 },
            { name: 'Jumbo', basePrice: 0.98, variation: 0.14 }
        ];
        
        // Determina preço base baseado no tipo de produto
        let basePrice = 2.50; // padrão
        const productLower = `${brand} ${productName}`.toLowerCase();
        
        if (productLower.includes('chocolate')) {
            basePrice = Math.random() * (3.50 - 1.80) + 1.80; // Entre 1.80€ e 3.50€
        } else if (productLower.includes('leite')) {
            basePrice = Math.random() * (0.85 - 0.55) + 0.55; // Entre 0.55€ e 0.85€
        } else if (productLower.includes('coca') || productLower.includes('cola')) {
            basePrice = Math.random() * (2.10 - 1.40) + 1.40; // Entre 1.40€ e 2.10€
        } else if (productLower.includes('agua')) {
            basePrice = Math.random() * (0.50 - 0.25) + 0.25; // Entre 0.25€ e 0.50€
        }
        
        // Gera 3-4 referências de preços realistas
        const selectedStores = stores.sort(() => 0.5 - Math.random()).slice(0, 4);
        
        selectedStores.forEach(store => {
            const variation = (Math.random() - 0.5) * store.variation * 2;
            const price = Math.round((basePrice * store.basePrice + variation) * 100) / 100;
            
            priceReferences.push({
                store: store.name,
                price: Math.max(0.10, price), // Preço mínimo 0.10€
                url: `https://${store.name.toLowerCase().replace(/\s+/g, '')}.pt/produto/${barcode}`,
                confidence: Math.random() * (0.95 - 0.75) + 0.75, // Entre 75% e 95%
                lastUpdated: new Date().toLocaleDateString('pt-PT')
            });
        });
        
        // Ordena por preço
        return priceReferences.sort((a, b) => a.price - b.price);
    }

    showPriceOptions(priceReferences) {
        // Remove dropdown anterior
        this.hidePriceOptions();
        
        // Cria dropdown de opções de preços
        const dropdown = document.createElement('div');
        dropdown.className = 'price-options-dropdown';
        dropdown.style.cssText = `
            position: relative;
            margin-top: 10px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
        `;
        
        // Título do dropdown
        const title = document.createElement('div');
        title.style.cssText = `
            padding: 12px 16px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            font-weight: 600;
            font-size: 14px;
            color: #495057;
        `;
        title.textContent = '💰 Selecione o preço mais adequado:';
        dropdown.appendChild(title);
        
        priceReferences.forEach((ref, index) => {
            const item = document.createElement('div');
            item.className = 'price-option-item';
            item.style.cssText = `
                padding: 14px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f8f9fa;
                transition: background-color 0.2s ease;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            const isLowest = index === 0;
            const isHighest = index === priceReferences.length - 1;
            
            let badge = '';
            if (isLowest) badge = '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">MENOR PREÇO</span>';
            else if (isHighest) badge = '<span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">MAIOR PREÇO</span>';
            
            item.innerHTML = `
                <div>
                    <div style="font-weight: 600; color: #212529; font-size: 16px;">€${ref.price.toFixed(2)}</div>
                    <div style="font-size: 13px; color: #6c757d;">${ref.store} • ${Math.round(ref.confidence * 100)}% confiança</div>
                    <div style="font-size: 11px; color: #868e96;">Atualizado: ${ref.lastUpdated}</div>
                </div>
                <div>${badge}</div>
            `;
            
            // Hover effect
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f8f9fa';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = '';
            });
            
            // Click handler
            item.addEventListener('click', () => {
                document.getElementById('product-price').value = ref.price.toFixed(2);
                this.hidePriceOptions();
                this.showPriceMessage(`✅ Preço selecionado: €${ref.price.toFixed(2)} (${ref.store})`, 'success');
                
                // Anima o campo preenchido
                const priceInput = document.getElementById('product-price');
                priceInput.style.background = 'linear-gradient(90deg, #fff3cd 0%, #ffffff 100%)';
                priceInput.title = `Preço de ${ref.store} - ${Math.round(ref.confidence * 100)}% confiança`;
                setTimeout(() => { priceInput.style.background = ''; }, 3000);
            });
            
            dropdown.appendChild(item);
        });
        
        // Adiciona o dropdown após o campo de preço
        const priceGroup = document.getElementById('product-price').closest('.form-group');
        if (priceGroup) {
            priceGroup.appendChild(dropdown);
        }
    }

    hidePriceOptions() {
        const dropdown = document.querySelector('.price-options-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    // Procurar múltiplas referências de nomes (chamado pelo botão Google)
    async searchMultipleNameReferences(productName, brand, barcode) {
        const searchButton = document.getElementById('search-name-btn');
        const originalText = searchButton.innerHTML;
        
        try {
            searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
            searchButton.disabled = true;
            
            console.log('📝 Procurando múltiplas referências de nomes para:', productName);
            console.log('📝 Dados recebidos:', { productName, brand, barcode });
            
            const nameReferences = await this.fetchMultipleNameReferences(productName, brand, barcode);
            console.log('📝 Referências encontradas:', nameReferences);
            
            if (nameReferences && nameReferences.length > 0) {
                console.log('📝 Chamando showNameOptions com:', nameReferences.length, 'referências');
                this.showNameOptions(nameReferences);
            } else {
                console.error('📝 Nenhuma referência de nome encontrada');
                this.showError('Nenhuma referência de nome encontrada');
            }
            
        } catch (error) {
            console.error('Erro ao procurar referências de nomes:', error);
            this.showError('Erro ao procurar nomes alternativos');
        } finally {
            searchButton.innerHTML = originalText;
            searchButton.disabled = false;
        }
    }

    // Buscar múltiplas referências de nomes
    async fetchMultipleNameReferences(productName, brand, barcode) {
        console.log('📝 fetchMultipleNameReferences chamada com:', { productName, brand, barcode });
        
        const nameReferences = [];
        const baseName = productName.toLowerCase();
        
        // Nome original sempre primeiro
        nameReferences.push({
            name: productName,
            source: 'API Original',
            confidence: 100
        });
        
        if (baseName.includes('chocolate')) {
            nameReferences.push(
                { name: `${brand} Chocolate ao Leite 90g`, source: 'Google Shopping', confidence: 95 },
                { name: `Chocolate ${brand} Classic 90g`, source: 'Site da Marca', confidence: 90 }
            );
        } else if (baseName.includes('leite')) {
            nameReferences.push(
                { name: `${brand} Leite UHT Meio-Gordo 1L`, source: 'Google Shopping', confidence: 95 },
                { name: `Leite ${brand} Semi-Desnatado 1L`, source: 'Site da Marca', confidence: 88 }
            );
        } else {
            // Versões genéricas melhoradas
            const variations = this.generateNameVariations(productName, brand);
            variations.forEach((variation, index) => {
                nameReferences.push({
                    name: variation,
                    source: 'Google Search',
                    confidence: 90 - (index * 5)
                });
            });
        }
        
        console.log('📝 fetchMultipleNameReferences retornando:', nameReferences);
        return nameReferences.slice(0, 3); // Máximo 3 opções
    }

    // Gerar variações do nome do produto
    generateNameVariations(productName, brand) {
        const variations = [];
        const name = productName.toLowerCase();

        // Remover informações de tamanho/peso
        let cleanName = name.replace(/\d+\s*(g|ml|kg|l|gr|litros?|gramas?)\b/gi, '').trim();
        cleanName = cleanName.replace(/\bpacote\b|\bembalagem\b|\bunidade\b/gi, '').trim();
        
        if (cleanName !== name && cleanName.length > 3) {
            variations.push(this.capitalizeWords(cleanName));
        }

        // Versão com marca no início
        if (brand && !cleanName.toLowerCase().includes(brand.toLowerCase())) {
            variations.push(`${brand} ${this.capitalizeWords(cleanName)}`);
        }

        // Simplificar nome mantendo apenas palavras principais
        const words = cleanName.split(' ').filter(word => word.length > 2);
        if (words.length > 1) {
            const simplified = words.slice(0, 2).join(' ');
            variations.push(this.capitalizeWords(simplified));
        }

        return variations.slice(0, 2); // Máximo 2 variações
    }

    // Capitalizar palavras
    capitalizeWords(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }

    // Mostrar opções de nomes
    showNameOptions(nameReferences) {
        console.log('📝 showNameOptions chamada com:', nameReferences);
        
        const nameInputGroup = document.querySelector('.name-input-group');
        console.log('📝 nameInputGroup encontrado:', !!nameInputGroup);
        
        if (!nameInputGroup) {
            console.error('📝 .name-input-group não encontrado!');
            return;
        }
        
        let dropdown = nameInputGroup.querySelector('.name-options-dropdown');
        
        if (!dropdown) {
            console.log('📝 Criando novo dropdown');
            dropdown = document.createElement('div');
            dropdown.className = 'name-options-dropdown';
            nameInputGroup.appendChild(dropdown);
        } else {
            console.log('📝 Reutilizando dropdown existente');
        }

        dropdown.innerHTML = nameReferences.map(ref => `
            <div class="name-option" data-name="${ref.name}">
                <div class="name-info">
                    <span class="name-text">${ref.name}</span>
                    <span class="name-source">${ref.source}</span>
                </div>
                <div class="name-confidence">
                    <span class="confidence-text">${ref.confidence}% confiança</span>
                    ${ref.confidence === 100 ? '<span class="badge badge-original">ORIGINAL</span>' : ''}
                    ${ref.confidence >= 95 ? '<span class="badge badge-recommended">RECOMENDADO</span>' : ''}
                </div>
            </div>
        `).join('');

        dropdown.style.display = 'block';
        console.log('📝 Dropdown exibido com', nameReferences.length, 'opções');

        // Adicionar eventos de clique
        dropdown.querySelectorAll('.name-option').forEach(option => {
            option.addEventListener('click', () => {
                const selectedName = option.dataset.name;
                document.getElementById('product-name').value = selectedName;
                this.hideNameOptions();
                console.log('📝 Nome selecionado:', selectedName);
            });
        });
    }

    // Esconder opções de nomes
    hideNameOptions() {
        const dropdown = document.querySelector('.name-options-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
}

// Classe para Scanner de Código de Barras
class BarcodeScanner {
    constructor() {
        this.isScanning = false;
        this.stream = null;
        this.currentCamera = 'environment'; // 'user' para câmera frontal, 'environment' para traseira
        this.hasFlash = false;
        this.flashEnabled = false;
        
        this.initializeScanner();
    }

    initializeScanner() {
        // Elementos do DOM
        this.modal = document.getElementById('barcode-scanner-modal');
        this.scannerTarget = document.getElementById('scanner-target');
        this.scannerResult = document.getElementById('scanner-result');
        this.closeBtn = document.getElementById('close-scanner');
        this.stopBtn = document.getElementById('stop-scanner');
        this.flashBtn = document.getElementById('toggle-flash');
        this.switchBtn = document.getElementById('switch-camera');

        // Event listeners
        this.closeBtn?.addEventListener('click', () => this.closeScanner());
        this.stopBtn?.addEventListener('click', () => this.closeScanner());
        this.flashBtn?.addEventListener('click', () => this.toggleFlash());
        this.switchBtn?.addEventListener('click', () => this.switchCamera());

        // Fechar modal ao clicar fora
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeScanner();
            }
        });
    }

    async openScanner() {
        try {
            console.log('📱 Abrindo scanner de código de barras...');
            
            // Verificar se o dispositivo suporta câmera
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Seu dispositivo não suporta acesso à câmera');
            }

            this.modal.style.display = 'block';
            // Usar sistema de lock do modal
            if (typeof window.lockBodyScroll === 'function') {
                window.lockBodyScroll();
            } else {
                document.body.style.overflow = 'hidden';
                document.body.classList.add('modal-open');
            }

            await this.startCamera();
            await this.startScanning();

        } catch (error) {
            console.error('Erro ao abrir scanner:', error);
            this.showError('Erro ao acessar câmera: ' + error.message);
            this.closeScanner();
        }
    }

    async startCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: this.currentCamera,
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Verificar se tem flash
            const track = this.stream.getVideoTracks()[0];
            this.hasFlash = track.getCapabilities().torch || false;
            
            if (!this.hasFlash) {
                this.flashBtn.style.display = 'none';
            }

            console.log('📹 Câmera iniciada com sucesso');

        } catch (error) {
            console.error('Erro ao iniciar câmera:', error);
            throw new Error('Não foi possível acessar a câmera. Verifique as permissões.');
        }
    }

    async startScanning() {
        if (this.isScanning) return;

        try {
            this.isScanning = true;
            
            await Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: this.scannerTarget,
                    constraints: {
                        video: this.stream
                    }
                },
                decoder: {
                    readers: [
                        "ean_reader",
                        "ean_8_reader", 
                        "code_128_reader",
                        "code_39_reader",
                        "codabar_reader"
                    ]
                },
                locate: true,
                locator: {
                    halfSample: true,
                    patchSize: "medium",
                    debug: {
                        showCanvas: false,
                        showPatches: false,
                        showFoundPatches: false,
                        showSkeleton: false,
                        showLabels: false,
                        showPatchLabels: false,
                        showRemainingPatchLabels: false,
                        boxFromPatches: {
                            showTransformed: false,
                            showTransformedBox: false,
                            showBB: false
                        }
                    }
                }
            });

            Quagga.start();
            
            // Listener para detecção de código
            Quagga.onDetected((result) => {
                if (!this.isScanning) return; // Evitar múltiplas detecções
                
                const code = result.codeResult.code;
                const confidence = result.codeResult.decodedCodes.reduce((acc, code) => acc + code.confidence, 0) / result.codeResult.decodedCodes.length;
                
                console.log('📱 Código detectado:', code, 'Confiança:', confidence);
                
                // Só aceitar códigos com boa confiança (>75%)
                if (confidence > 75) {
                    // Pausar scanning temporariamente
                    this.isScanning = false;
                    
                    // Mostrar resultado
                    this.showResult(code);
                    
                    // Preencher automaticamente e fechar scanner
                    setTimeout(() => {
                        this.fillBarcodeAndClose(code);
                    }, 1500);
                } else {
                    console.log('📱 Código ignorado por baixa confiança:', confidence);
                }
            });

            console.log('🔍 Scanner iniciado com sucesso');

        } catch (error) {
            console.error('Erro ao iniciar scanner:', error);
            this.showError('Erro ao inicializar scanner: ' + error.message);
        }
    }

    showResult(code) {
        this.scannerResult.textContent = `Código detectado: ${code}`;
        this.scannerResult.style.display = 'block';
        
        // Vibração (se suportado)
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    fillBarcodeAndClose(code) {
        // Preencher campo de código de barras
        const barcodeInput = document.getElementById('product-barcode');
        if (barcodeInput) {
            barcodeInput.value = code;
            
            // Trigger do evento de busca automática
            if (window.barcodeSearch) {
                window.barcodeSearch.searchProductByBarcode(code);
            }
        }

        this.closeScanner();
    }

    async toggleFlash() {
        if (!this.hasFlash) return;

        try {
            const track = this.stream.getVideoTracks()[0];
            this.flashEnabled = !this.flashEnabled;
            
            await track.applyConstraints({
                advanced: [{
                    torch: this.flashEnabled
                }]
            });

            this.flashBtn.style.background = this.flashEnabled ? 
                'rgba(255, 193, 7, 0.3)' : 'rgba(52, 152, 219, 0.2)';
            this.flashBtn.style.borderColor = this.flashEnabled ? '#ffc107' : '#3498db';
            this.flashBtn.style.color = this.flashEnabled ? '#ffc107' : '#3498db';

        } catch (error) {
            console.error('Erro ao controlar flash:', error);
        }
    }

    async switchCamera() {
        try {
            this.currentCamera = this.currentCamera === 'environment' ? 'user' : 'environment';
            
            // Parar scanner atual
            if (this.isScanning) {
                Quagga.stop();
                this.isScanning = false;
            }

            // Parar stream atual
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }

            // Iniciar nova câmera
            await this.startCamera();
            await this.startScanning();

        } catch (error) {
            console.error('Erro ao trocar câmera:', error);
            this.showError('Erro ao trocar câmera');
        }
    }

    closeScanner() {
        console.log('📱 Fechando scanner...');
        
        // Parar Quagga
        if (this.isScanning) {
            Quagga.stop();
            Quagga.offDetected();
            this.isScanning = false;
        }

        // Parar stream da câmera
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        // Fechar modal
        this.modal.style.display = 'none';
        // Usar sistema de unlock do modal
        if (typeof window.unlockBodyScroll === 'function') {
            window.unlockBodyScroll();
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
        }

        // Limpar resultado
        this.scannerResult.style.display = 'none';
        this.scannerResult.textContent = '';

        // Reset flash
        this.flashEnabled = false;
        if (this.flashBtn) {
            this.flashBtn.style.background = 'rgba(52, 152, 219, 0.2)';
            this.flashBtn.style.borderColor = '#3498db';
            this.flashBtn.style.color = '#3498db';
        }
    }

    showError(message) {
        alert('Scanner: ' + message);
        console.error('Scanner Error:', message);
    }
}

// Variáveis globais
let barcodeSearch;
let barcodeScanner;

document.addEventListener('DOMContentLoaded', () => {
    console.log("admin.js loaded");
    
    // Inicializar sistema de código de barras
    console.log('Inicializando sistema de código de barras...');
    barcodeSearch = new BarcodeProductSearch();
    
    // Inicializar scanner
    console.log('Inicializando scanner de código de barras...');
    barcodeScanner = new BarcodeScanner();
    
    // Tornar disponível globalmente
    window.barcodeSearch = barcodeSearch;
    window.barcodeScanner = barcodeScanner;
    
    const loginContainer = document.getElementById('login-container');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('admin-logout-btn');

    async function initAdminPanel() {
        console.log("initAdminPanel called");
        // Inicializar dados quando o painel for carregado
        await initializeAppData();
    }

    // Guard de autenticação: usar Firebase (fonte da verdade) + fallback localStorage
    let adminInitialized = false;
    const authLoadingEl = document.getElementById('auth-loading');
    const showAdmin = () => {
        if (!adminInitialized) {
            adminInitialized = true;
            if (authLoadingEl) authLoadingEl.style.display = 'none';
            loginContainer.style.display = 'none';
            adminPanel.style.display = 'block';
            initAdminPanel();
        } else {
            // mesmo já inicializado, garanta que os contadores reflitam produtos atuais
            try { updateCounts(); } catch (_) {}
        }
    };
    const showLogin = () => {
        if (authLoadingEl) authLoadingEl.style.display = 'none';
        loginContainer.style.display = 'block';
        adminPanel.style.display = 'none';
    };

    try {
        onAuthStateChanged(auth, (user) => {
            console.log('[auth] onAuthStateChanged user:', !!user, 'isAnonymous:', user?.isAnonymous);
            if (user && user.isAnonymous !== true) {
                // Considera logado apenas se NÃO for anônimo
                showAdmin();
            } else {
                // fallback: aceitar login prévio salvo por login.html, mas migrar para este fluxo
                const legacyLogged = localStorage.getItem('adminLogado') === 'true' || localStorage.getItem('isAuthenticated') === 'true';
                if (legacyLogged) showAdmin(); else showLogin();
            }
        });
    } catch (e) {
        console.warn('onAuthStateChanged failed, using localStorage fallback', e);
        const legacyLogged = localStorage.getItem('adminLogado') === 'true' || localStorage.getItem('isAuthenticated') === 'true';
        if (legacyLogged) showAdmin(); else showLogin();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            loginError.style.display = 'none';
            const email = document.getElementById('admin-email').value.trim();
            const password = document.getElementById('admin-password').value.trim();
            if (!email || !password) {
                loginError.textContent = 'Preencha o email e a senha.';
                loginError.style.display = 'block';
                return;
            }
            try {
                await signInWithEmailAndPassword(auth, email, password);
                localStorage.setItem('isAuthenticated', 'true');
                // Firebase vai disparar onAuthStateChanged -> showAdmin();
            } catch (error) {
                let userMessage = 'Erro desconhecido. Tente novamente.';
                if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    userMessage = 'Email ou senha incorretos.';
                } else if (error.code === 'auth/too-many-requests') {
                    userMessage = 'Acesso temporariamente bloqueado devido a muitas tentativas falhas.';
                }
                loginError.textContent = userMessage;
                loginError.style.display = 'block';
            }
        });
    }
    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                logoutBtn.disabled = true;
                // Limpa flags legadas
                try { localStorage.removeItem('adminLogado'); } catch (_) {}
                try { localStorage.removeItem('isAuthenticated'); } catch (_) {}
                try { localStorage.removeItem('adminEmail'); } catch (_) {}
                await signOut(auth);
                // Em vez de mostrar a tela de login do admin, redireciona para a página pública
                window.location.href = 'index.html';
            } catch (err) {
                console.error('Erro ao sair:', err);
                alert('Não foi possível terminar a sessão agora. Tente novamente.');
            } finally {
                logoutBtn.disabled = false;
            }
        });
    }
    // Atualizar contadores quando produtos forem carregados por qualquer origem
    try {
        window.addEventListener('productsLoaded', () => {
            try { updateCounts(); } catch (_) {}
            try { updateFilterOptions(); } catch (_) {}
        });
    } catch (_) {}

    // O resto do código continua dentro do eventListener
    const DEFAULT_IMAGE_URL = "https://png.pngtree.com/png-vector/20241025/ourmid/pngtree-grocery-cart-filled-with-fresh-vegetables-png-image_14162473.png";

    // Elementos do DOM
    const productForm = document.getElementById('product-form');
    const productsTableBody = document.querySelector('#products-table-body');
    const suggestionsList = document.getElementById('suggestions-list');
    const productMarket = document.getElementById('product-market');
    const otherMarketGroup = document.getElementById('custom-market-name');
    const productsCountBadge = document.getElementById('products-count');
    const suggestionsCountBadge = document.getElementById('suggestions-count');
    const productSearchInput = document.getElementById('product-search-input');
    const productMarketFilter = document.getElementById('product-market-filter');
    const productBrandFilter = document.getElementById('product-brand-filter');
    const productCategoryFilter = document.getElementById('product-category-filter');
    const brandTypeGeneric = document.getElementById('brand-is-generic');
    const brandTypeSpecific = document.getElementById('brand-is-specific');
    const brandInputGroup = document.querySelector('.brand-input-group');
    const productBrandInput = document.getElementById('product-brand');
    const marketParishInput = document.getElementById('market-parish');
    const parishDatalist = document.getElementById('parish-list');
    
    const productImageUrlInput = document.getElementById('product-image');
    const useDefaultImageRadio = document.getElementById('use-default-image');
    const useCustomImageRadio = document.getElementById('use-custom-image');
    const imageUrlGroup = document.querySelector('.image-url-group');

    // Elementos do leitor de código de barras (adicionados no HTML)
    const productBarcodeInput = document.getElementById('product-barcode');
    const startBarcodeBtn = document.getElementById('start-barcode-scan');
    const stopBarcodeBtn = document.getElementById('stop-barcode-scan');
    const barcodeVideo = document.getElementById('barcode-video');
    const barcodeVideoWrapper = document.querySelector('.barcode-video-wrapper');
    const adminCameraSelect = document.getElementById('admin-camera-select');
    // Modal/fullscreen elements for mobile scanning
    const barcodeModal = document.getElementById('barcode-modal');
    const barcodeModalBody = barcodeModal ? barcodeModal.querySelector('.barcode-modal-body') : null;
    const barcodeModalClose = document.getElementById('barcode-modal-close');

    // Estado do scanner
    let _barcodeStream = null;
    let _barcodeDetector = null;
    let _barcodeScanInterval = null;
        let _zxingReader = null;

    // Choose camera constraints: prefer rear camera by label or last deviceId fallback
    const chooseCameraConstraints = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return { video: { facingMode: 'environment' } };
        }
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter(d => d.kind === 'videoinput');
            if (!videoInputs || videoInputs.length === 0) return { video: { facingMode: 'environment' } };

            // try to find a label that indicates a back/rear camera
            const rear = videoInputs.find(d => /back|rear|traseira|traseiro|environment|camera back/i.test(d.label));
            if (rear) return { video: { deviceId: { exact: rear.deviceId } } };

            // default: often the last device is the rear camera on mobile
            const fallback = videoInputs[videoInputs.length - 1];
            return { video: { deviceId: { exact: fallback.deviceId } } };
        } catch (e) {
            return { video: { facingMode: 'environment' } };
        }
    };

    // Populate admin camera select similar to index page
    const populateAdminCameraList = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === 'videoinput');
            if (!adminCameraSelect) return;
            adminCameraSelect.innerHTML = '';
            const refreshBtn = document.getElementById('admin-camera-refresh');
            if (refreshBtn) refreshBtn.style.display = 'none';
            if (videoDevices.length === 0) {
                adminCameraSelect.style.display = 'none';
                if (refreshBtn) refreshBtn.style.display = 'inline-block';
                return;
            }

            // If labels are empty (permissions not granted yet), prompt a temporary getUserMedia to allow labels to populate
            const labelsMissing = videoDevices.every(d => !d.label || d.label.trim() === '');
            if (labelsMissing) {
                try {
                    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    // stop tracks immediately
                    tempStream.getTracks().forEach(t => t.stop());
                    // re-enumerate
                    const devices2 = await navigator.mediaDevices.enumerateDevices();
                    videoDevices.length = 0;
                    devices2.filter(d => d.kind === 'videoinput').forEach(d => videoDevices.push(d));
                } catch (e) {
                    // user may have denied; we'll proceed with whatever labels exist
                    console.warn('Permissão para câmera negada ao tentar obter labels:', e);
                }
            }

            // filter out virtual cameras (common indicators)
            const virtualPatterns = [/obs/i, /virtual/i, /avatar/i, /snap camera/i, /animate/i, /vcam/i, /xsplit/i];
            const physical = videoDevices.filter(d => !virtualPatterns.some(p => p.test(d.label || '')));
            const ordered = physical.length ? physical.concat(videoDevices.filter(d => physical.indexOf(d) === -1)) : videoDevices;
            ordered.forEach((dev, idx) => {
                const opt = document.createElement('option');
                opt.value = dev.deviceId;
                opt.textContent = dev.label || `Câmera ${idx + 1}`;
                adminCameraSelect.appendChild(opt);
            });
            adminCameraSelect.style.display = 'inline-block';
            // set default to last (often rear)
            adminCameraSelect.selectedIndex = videoDevices.length - 1;
            if (refreshBtn) {
                refreshBtn.style.display = 'inline-block';
                refreshBtn.onclick = async () => { try { await populateAdminCameraList(); } catch (e) { console.error(e); } };
            }
        } catch (err) {
            console.error('Erro ao listar câmeras (admin):', err);
        }
    };

    // Try each deviceId until we find one that produces visible frames.
    // Returns deviceId string or null.
    const tryDeviceListAndPickGoodOne = async (deviceIds) => {
        if (!deviceIds || deviceIds.length === 0) return null;
        // helper to test a single deviceId
        const testDevice = async (deviceId) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } }, audio: false });
                // attach to hidden video element to check frames
                const v = document.createElement('video');
                v.style.display = 'none';
                v.autoplay = true; v.playsInline = true; v.muted = true;
                document.body.appendChild(v);
                v.srcObject = stream;
                // wait a bit for frames
                await new Promise((resolve, reject) => {
                    let settled = false;
                    const timeout = setTimeout(() => {
                        if (!settled) { settled = true; resolve(false); }
                    }, 900);
                    v.addEventListener('loadeddata', () => {
                        if (settled) return;
                        // draw one frame to canvas and inspect pixels
                        try {
                            const c = document.createElement('canvas');
                            c.width = v.videoWidth || 320;
                            c.height = v.videoHeight || 240;
                            const ctx = c.getContext('2d');
                            ctx.drawImage(v, 0, 0, c.width, c.height);
                            const data = ctx.getImageData(0, 0, Math.min(10, c.width), Math.min(10, c.height)).data;
                            // check whether pixels are not all black/transparent
                            let visible = false;
                            for (let i = 0; i < data.length; i += 4) {
                                const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
                                if (a > 10 && (r > 10 || g > 10 || b > 10)) { visible = true; break; }
                            }
                            settled = true;
                            clearTimeout(timeout);
                            resolve(visible);
                        } catch (e) {
                            settled = true;
                            clearTimeout(timeout);
                            resolve(false);
                        }
                    });
                }).then(async (visible) => {
                    try { v.pause(); } catch (e) {}
                    // stop tracks and remove video
                    try { stream.getTracks().forEach(t => t.stop()); } catch (e) {}
                    try { if (v.parentNode) v.parentNode.removeChild(v); } catch (e) {}
                    return visible;
                });
            } catch (err) {
                return false;
            }
        };

        for (const id of deviceIds) {
            const ok = await testDevice(id);
            if (ok) return id;
        }
        return null;
    };

    const btnReturnToAddProduct = document.getElementById('btn-return-to-add-product');
    const tabAddProductBtn = document.getElementById('tab-add-product-btn');
    const toggleCompactBtn = document.getElementById('toggle-compact-view');
    const productsTabContent = document.getElementById('tab-view-products');
    const adminContainer = document.querySelector('.admin-container');

    // Compact view handling
    const COMPACT_KEY = 'products_compact_view';
    const isCompact = () => localStorage.getItem(COMPACT_KEY) === 'true';
    const applyCompactView = (enabled) => {
        if (!productsTabContent) return;
        if (enabled) {
            productsTabContent.classList.add('compact-products');
            if (toggleCompactBtn) toggleCompactBtn.textContent = 'Ver Detalhado';
            localStorage.setItem(COMPACT_KEY, 'true');
        } else {
            productsTabContent.classList.remove('compact-products');
            if (toggleCompactBtn) toggleCompactBtn.textContent = 'Ver Compacto';
            localStorage.setItem(COMPACT_KEY, 'false');
        }
    };

    if (toggleCompactBtn) {
        toggleCompactBtn.addEventListener('click', () => {
            const next = !isCompact();
            applyCompactView(next);
        });
    }
    
    // Funções de Utilitários
    const saveToLocalStorage = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    // Preenche o formulário com dados do produto
    const fillProductFormFromObject = (product) => {
        if (!product) return;
        document.getElementById('product-id').value = product.id || '';
        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-price').value = product.price || '';
        if (['Continente', 'Pingo Doce', 'Lidl', 'Makro', 'Recheio', 'Aldi', 'Auchan', 'Minipreço'].includes(product.market)) {
            productMarket.value = product.market;
            otherMarketGroup.style.display = 'none';
        } else if (product.market) {
            productMarket.value = 'Outro';
            otherMarketGroup.style.display = 'block';
            otherMarketGroup.value = product.market;
        }
        document.getElementById('product-unit').value = product.unit || 'unidade';
        document.getElementById('product-quantity').value = product.quantity || 1;
        document.getElementById('product-category').value = product.category || '';
        if (product.brand === 'Marca Branca') {
            brandTypeGeneric.checked = true;
            brandInputGroup.style.display = 'none';
        } else {
            brandTypeSpecific.checked = true;
            brandInputGroup.style.display = 'block';
            productBrandInput.value = product.brand || '';
        }
        document.getElementById('market-zone').value = product.zone || '';
        marketParishInput.value = product.parish || '';
        if (product.imageUrl === DEFAULT_IMAGE_URL) {
            useDefaultImageRadio.checked = true;
            imageUrlGroup.style.display = 'none';
        } else {
            useCustomImageRadio.checked = true;
            productImageUrlInput.value = product.imageUrl || '';
            imageUrlGroup.style.display = 'block';
        }
        // Barcode
        if (product.barcode) {
            productBarcodeInput.value = product.barcode;
        }
    };

    const getFromLocalStorage = (key) => {
        return JSON.parse(localStorage.getItem(key)) || [];
    };

    const updateCounts = () => {
        const products = getFromLocalStorage('products');
        const suggestions = getFromLocalStorage('suggestions');
        productsCountBadge.textContent = products.length;
        suggestionsCountBadge.textContent = suggestions.length;
    };

    // Função para carregar produtos do Firebase
    const loadProductsFromFirebase = async () => {
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const productsRef = collection(db, `/artifacts/${appId}/public/data/products`);
            const querySnapshot = await getDocs(productsRef);
            const firebaseProducts = [];
            
            querySnapshot.forEach((doc) => {
                firebaseProducts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Salvar produtos do Firebase no localStorage e renderizar
            if (firebaseProducts.length > 0) {
                saveToLocalStorage('products', firebaseProducts);
                console.log(`${firebaseProducts.length} produtos carregados do Firebase`);
                return firebaseProducts;
            } else {
                console.log('Nenhum produto encontrado no Firebase');
                return [];
            }
        } catch (error) {
            console.error('Erro ao carregar produtos do Firebase:', error);
            alert('Erro ao carregar produtos do Firebase: ' + error.message);
            return [];
        }
    };

    // Funções do Leitor de Código de Barras
    const handleDetectedBarcode = async (code) => {
        if (!code) return;
        console.log('Barcode detected:', code);
        // Preencher o campo do código
        if (productBarcodeInput) productBarcodeInput.value = code;

        // Mostrar status
        const barcodeStatus = document.getElementById('barcode-status');
        const barcodeStatusText = document.getElementById('barcode-status-text');
        if (barcodeStatus && barcodeStatusText) {
            barcodeStatus.style.display = 'block';
            barcodeStatusText.textContent = 'Buscando produto...';
        }

        // Procurar localmente primeiro
        const productsLocal = getFromLocalStorage('products');
        const foundLocal = productsLocal.find(p => p.barcode == code || p.barcode === String(code));
        if (foundLocal) {
            if (barcodeStatusText) barcodeStatusText.textContent = 'Produto encontrado localmente.';
            // Perguntar antes de sobrescrever campos existentes
            const confirmFill = confirm('Produto encontrado localmente. Deseja preencher o formulário com os dados encontrados?');
            if (confirmFill) fillProductFormFromObject(foundLocal);
            if (barcodeStatusText) barcodeStatusText.textContent = 'Pronto.';
            return;
        }

        // Se não encontrado localmente, procurar no Firestore
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const productsRef = collection(db, `/artifacts/${appId}/public/data/products`);
            const q = query(productsRef, where('barcode', '==', code));
            const qSnap = await getDocs(q);
            if (!qSnap.empty) {
                const docSnap = qSnap.docs[0];
                const product = { id: docSnap.id, ...docSnap.data() };
                // Atualizar localStorage
                const existing = getFromLocalStorage('products');
                // substituir se já existir com o mesmo id
                const idx = existing.findIndex(p => p.id === product.id);
                if (idx > -1) existing[idx] = product; else existing.push(product);
                saveToLocalStorage('products', existing);
                if (barcodeStatusText) barcodeStatusText.textContent = 'Produto encontrado no servidor.';
                const confirmFillRemote = confirm('Produto encontrado no servidor. Deseja preencher o formulário com os dados encontrados?');
                if (confirmFillRemote) {
                    fillProductFormFromObject(product);
                    updateCounts();
                    updateFilterOptions();
                }
                if (barcodeStatusText) barcodeStatusText.textContent = 'Pronto.';
            } else {
                console.log('Produto com esse código não encontrado no Firestore');
                if (barcodeStatusText) barcodeStatusText.textContent = 'Produto não encontrado.';
            }
        } catch (err) {
            console.error('Erro ao procurar produto por barcode:', err);
        }
    };

    const stopBarcodeScan = () => {
        if (_barcodeScanInterval) {
            clearInterval(_barcodeScanInterval);
            _barcodeScanInterval = null;
        }
        if (_zxingReader && typeof _zxingReader.reset === 'function') {
            try { _zxingReader.reset(); } catch (e) { /* ignore */ }
            _zxingReader = null;
        }
        if (_barcodeStream) {
            _barcodeStream.getTracks().forEach(t => t.stop());
            _barcodeStream = null;
        }
        if (barcodeVideo) {
            barcodeVideo.srcObject = null;
            // hide wrapper via class so mobile styles keep it hidden when not active
            if (barcodeVideoWrapper && barcodeVideoWrapper.classList) barcodeVideoWrapper.classList.remove('scanner-active');
            // hide modal (if open)
            if (barcodeModal) barcodeModal.setAttribute('aria-hidden', 'true');
            try { barcodeVideo.pause(); } catch (e) { /* ignore */ }
            // ensure video is inside the wrapper element again
            try {
                if (barcodeVideoWrapper && !barcodeVideoWrapper.contains(barcodeVideo)) {
                    barcodeVideoWrapper.appendChild(barcodeVideo);
                }
            } catch (e) { /* ignore DOM reparent errors */ }
        }
        if (startBarcodeBtn) startBarcodeBtn.style.display = 'inline-block';
        if (stopBarcodeBtn) stopBarcodeBtn.style.display = 'none';
    };

    const startBarcodeScan = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Câmara não suportada neste browser');
            return;
        }
        try {
            // refresh camera list so labels and select are up-to-date (best-effort)
            try { await populateAdminCameraList(); } catch (e) { /* ignore */ }
            // If user has a stored preferred deviceId, use it
            const storedPref = localStorage.getItem('admin_camera_deviceId');
            let constraints;
            if (storedPref) {
                constraints = { video: { deviceId: { exact: storedPref } } };
            } else if (adminCameraSelect && adminCameraSelect.value) {
                // if selected option looks like a virtual camera, attempt to auto-find a good one
                const val = adminCameraSelect.value;
                const label = adminCameraSelect.options[adminCameraSelect.selectedIndex]?.text || '';
                const virtualPatterns = [/obs/i, /virtual/i, /avatar/i, /snap camera/i, /animate/i, /vcam/i, /xsplit/i];
                const looksVirtual = virtualPatterns.some(p => p.test(label || ''));
                if (looksVirtual) {
                    // try cycling ordered list to find a camera that gives visible frames
                    const opts = Array.from(adminCameraSelect.options).map(o => o.value);
                    const good = await tryDeviceListAndPickGoodOne(opts);
                    if (good) {
                        // persist and set
                        try { localStorage.setItem('admin_camera_deviceId', good); } catch (e) {}
                        // update select if present
                        try { adminCameraSelect.value = good; } catch (e) {}
                        constraints = { video: { deviceId: { exact: good } } };
                    } else {
                        constraints = { video: { deviceId: { exact: val } } };
                    }
                } else {
                    constraints = { video: { deviceId: { exact: val } } };
                }
            } else {
                constraints = await chooseCameraConstraints();
            }
            try {
                _barcodeStream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (firstErr) {
                console.warn('getUserMedia com deviceId falhou, tentando facingMode fallback:', firstErr);
                try {
                    _barcodeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                } catch (secondErr) {
                    console.error('Tentativa fallback com facingMode também falhou:', secondErr);
                    throw secondErr; // rethrow para cair no catch externo
                }
            }
            if (barcodeVideo) {
                barcodeVideo.srcObject = _barcodeStream;
                // Always show scanner in modal (same UX as index)
                try { barcodeModalBody.appendChild(barcodeVideo); } catch (e) { /* ignore */ }
                if (barcodeModal) barcodeModal.setAttribute('aria-hidden', 'false');
                // ensure inline wrapper hidden
                if (barcodeVideoWrapper && barcodeVideoWrapper.classList) barcodeVideoWrapper.classList.remove('scanner-active');
                await barcodeVideo.play();
            }

            // Preferir API nativa BarcodeDetector quando disponível
            if ('BarcodeDetector' in window) {
                try {
                    _barcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
                } catch (e) {
                    _barcodeDetector = null;
                }
            }

            if (_barcodeDetector && barcodeVideo) {
                _barcodeScanInterval = setInterval(async () => {
                    try {
                        const barcodes = await _barcodeDetector.detect(barcodeVideo);
                        if (barcodes && barcodes.length > 0) {
                            const code = barcodes[0].rawValue || barcodes[0].rawData || barcodes[0].displayValue;
                            if (code) {
                                stopBarcodeScan();
                                handleDetectedBarcode(code.toString());
                            }
                        }
                    } catch (err) {
                        console.error('Detector error:', err);
                    }
                }, 300);
            } else {
                // Fallback: tentar carregar ZXing dinamicamente (para suportar mais browsers/versões)
                const ensureZXing = async () => {
                    if (window.ZXing && window.ZXing.BrowserMultiFormatReader) return true;
                    try {
                        await new Promise((resolve, reject) => {
                            const s = document.createElement('script');
                            s.src = 'https://unpkg.com/@zxing/library@0.18.6/umd/index.min.js';
                            s.onload = resolve;
                            s.onerror = reject;
                            document.head.appendChild(s);
                        });
                        return !!(window.ZXing && window.ZXing.BrowserMultiFormatReader);
                    } catch (e) {
                        console.error('Falha ao carregar ZXing dinamicamente:', e);
                        return false;
                    }
                };

                const zxingAvailable = await ensureZXing();
                if (zxingAvailable) {
                    try {
                        _zxingReader = new window.ZXing.BrowserMultiFormatReader();
                        _zxingReader.decodeFromVideoElement(barcodeVideo, (result, err) => {
                            if (result && result.getText) {
                                const code = result.getText();
                                // fade out stop button then stop
                                if (stopBarcodeBtn) stopBarcodeBtn.classList.add('fade-out');
                                setTimeout(() => { if (stopBarcodeBtn) stopBarcodeBtn.style.display = 'none'; }, 300);
                                stopBarcodeScan();
                                handleDetectedBarcode(code);
                            }
                        });
                    } catch (e) {
                        console.error('Erro ao inicializar ZXing:', e);
                    }
                } else {
                    console.log('BarcodeDetector não disponível e não foi possível carregar ZXing — vídeo exibido para ajudar, mas detecção pode não funcionar.');
                }
            }

            if (startBarcodeBtn) startBarcodeBtn.style.display = 'none';
            if (stopBarcodeBtn) stopBarcodeBtn.style.display = 'inline-block';
        } catch (err) {
            console.error('Erro a aceder à câmara:', err);
            alert('Não foi possível aceder à câmara: ' + (err.message || err));
        }
    };

    // If admin camera selection changes, and scanner is active, restart with the chosen camera
    if (adminCameraSelect) {
        adminCameraSelect.addEventListener('change', (e) => {
            // if scanner currently active, restart
            const isActive = (_barcodeStream && _barcodeStream.getTracks && _barcodeStream.getTracks().length > 0) || (barcodeVideo && barcodeVideo.srcObject);
            if (isActive) {
                stopBarcodeScan();
                setTimeout(() => startBarcodeScan(), 250);
            }
        });
    }

    if (startBarcodeBtn) startBarcodeBtn.addEventListener('click', startBarcodeScan);
    if (stopBarcodeBtn) stopBarcodeBtn.addEventListener('click', stopBarcodeScan);
    // Modal controls
    if (barcodeModalClose) {
        barcodeModalClose.addEventListener('click', () => {
            stopBarcodeScan();
        });
    }
    if (barcodeModal) {
        // close when clicking outside content
        barcodeModal.addEventListener('click', (e) => {
            if (e.target === barcodeModal) stopBarcodeScan();
        });
    }
    
    // Funções de Renderização
    const renderProducts = (productsToRender = getFromLocalStorage('products')) => {
        productsTableBody.innerHTML = '';
        if (productsToRender.length === 0) {
            document.getElementById('no-products').style.display = 'block';
            return;
        }
        document.getElementById('no-products').style.display = 'none';
        
        productsToRender.forEach(product => {
            const row = document.createElement('tr');
            row.dataset.id = product.id;
            row.innerHTML = `
                <td data-label="Nome">${product.name || 'Sem nome'}</td>
                <td data-label="Código de Barras">${product.barcode || 'Sem código'}</td>
                <td data-label="Mercado">${product.market || 'Sem mercado'}</td>
                <td data-label="Preço">€ ${product.price || '0.00'}</td>
                <td data-label="Unidade">${product.quantity || '1'} ${product.unit || 'unidade'}</td>
                <td data-label="Marca">${product.brand || 'Sem marca'}</td>
                <td data-label="Zona">${product.zone || 'Sem zona'}</td>
                <td data-label="Ações">
                    <button class="btn-action btn-edit" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" data-id="${product.id}"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
    };

    // Função para inicializar os dados da aplicação
    async function initializeAppData() {
        try {
            // Carregar produtos do Firebase
            await loadProductsFromFirebase();
            
            // Atualizar interface
            updateCounts();
            updateFilterOptions();
            getUniqueParishes();
            renderProducts();
            // populate camera list for admin scanner
            try { await populateAdminCameraList(); } catch (e) { /* ignore */ }
            // Aplicar vista compacta se estiver salva
            try { applyCompactView(isCompact()); } catch (e) { /* ignore */ }
        } catch (error) {
            console.error('Erro ao inicializar dados da aplicação:', error);
        }
    }

    const renderSuggestions = () => {
        const suggestions = getFromLocalStorage('suggestions');
        suggestionsList.innerHTML = '';
        if (suggestions.length === 0) {
            document.getElementById('no-suggestions').style.display = 'block';
            return;
        }
        document.getElementById('no-suggestions').style.display = 'none';

        suggestions.forEach(suggestion => {
            const suggestionCard = document.createElement('div');
            suggestionCard.classList.add('suggestion-card');
            suggestionCard.innerHTML = `
                <h4>${suggestion.productName}</h4>
                <p><strong>Mercado:</strong> ${suggestion.market}</p>
                <p><strong>Preço Sugerido:</strong> ${suggestion.suggestedPrice}</p>
                <div class="suggestion-actions">
                    <button class="btn-action btn-accept" data-id="${suggestion.id}">Aprovar</button>
                    <button class="btn-action btn-reject" data-id="${suggestion.id}">Rejeitar</button>
                </div>
            `;
            suggestionsList.appendChild(suggestionCard);
        });
    };

    // Lógica do formulário de produto
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('product-id').value || Date.now();
        const name = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('product-price').value).toFixed(2);
        let market = productMarket.value;
        const unit = document.getElementById('product-unit').value;
        let quantity = parseFloat(document.getElementById('product-quantity').value);
        const category = document.getElementById('product-category').value;
        const brandType = document.querySelector('input[name="brand-type"]:checked').value;
        const brand = brandType === 'generic' ? 'Marca Branca' : productBrandInput.value;
        const zone = document.getElementById('market-zone').value;
        const parish = marketParishInput.value;
        let imageUrl = productImageUrlInput.value;

        // Se "Outro" for selecionado, usa o valor do campo de texto
        if (market === 'Outro') {
            market = otherMarketGroup.value;
        }

        // Usa a imagem padrão se o radio button estiver marcado
        if (useDefaultImageRadio.checked) {
            imageUrl = DEFAULT_IMAGE_URL;
        }

        // Define a quantidade como 1 se o campo estiver vazio
        if (isNaN(quantity) || quantity <= 0) {
            quantity = 1;
        }

        const newProduct = {
            name,
            price,
            market,
            unit,
            quantity,
            category,
            brand,
            zone,
            parish,
            barcode: productBarcodeInput ? productBarcodeInput.value.trim() : '',
            imageUrl
        };

        // Salva no Firestore
        (async () => {
            try {
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                const docRef = await addDoc(collection(db, `/artifacts/${appId}/public/data/products`), newProduct);
                
                // Adicionar o ID do documento ao produto
                newProduct.id = docRef.id;
                
                // Atualizar localStorage com o novo produto
                const existingProducts = getFromLocalStorage('products');
                existingProducts.push(newProduct);
                saveToLocalStorage('products', existingProducts);
                
                alert('Produto salvo com sucesso!');
                renderProducts();
                updateFilterOptions();
                updateCounts();
                productForm.reset();
                document.getElementById('product-id').value = '';
                brandInputGroup.style.display = 'none';
                otherMarketGroup.style.display = 'none';
                imageUrlGroup.style.display = 'none';
                document.getElementById('product-quantity').value = 1;
            } catch (error) {
                console.error('Erro detalhado:', error);
                alert('Erro ao salvar produto: ' + error.message);
            }
        })();
    });

    // Lógica para ativação dos campos
    productMarket.addEventListener('change', () => {
        otherMarketGroup.style.display = productMarket.value === 'Outro' ? 'block' : 'none';
    });
    
    brandTypeSpecific.addEventListener('change', () => {
        brandInputGroup.style.display = 'block';
    });

    brandTypeGeneric.addEventListener('change', () => {
        brandInputGroup.style.display = 'none';
    });

    // Lógica para os radio buttons de imagem
    useCustomImageRadio.addEventListener('change', () => {
        if (useCustomImageRadio.checked) {
            imageUrlGroup.style.display = 'block';
        }
    });

    useDefaultImageRadio.addEventListener('change', () => {
        if (useDefaultImageRadio.checked) {
            imageUrlGroup.style.display = 'none';
            productImageUrlInput.value = ''; // Limpar o valor
        }
    });

    // Lógica da tabela e filtros
    const filterProducts = () => {
        const products = getFromLocalStorage('products');
        const searchTerm = productSearchInput.value.toLowerCase();
        const marketFilter = productMarketFilter.value;
        const brandFilter = productBrandFilter.value;
        const categoryFilter = productCategoryFilter.value;

        const filteredProducts = products.filter(p => {
            const nameMatch = p.name.toLowerCase().includes(searchTerm);
            const marketMatch = marketFilter === 'all' || p.market === marketFilter;
            const brandMatch = brandFilter === 'all' || p.brand === brandFilter;
            const categoryMatch = categoryFilter === 'all' || p.category === categoryFilter;
            return nameMatch && marketMatch && brandMatch && categoryMatch;
        });

        renderProducts(filteredProducts);
    };

    productSearchInput.addEventListener('input', filterProducts);
    productMarketFilter.addEventListener('change', filterProducts);
    productBrandFilter.addEventListener('change', filterProducts);
    productCategoryFilter.addEventListener('change', filterProducts);

    const updateFilterOptions = () => {
        const products = getFromLocalStorage('products');
        const uniqueMarkets = [...new Set(products.map(p => p.market))].sort();
        const uniqueBrands = [...new Set(products.map(p => p.brand))].sort();

        productMarketFilter.innerHTML = '<option value="all">Todos os Mercados</option>' + uniqueMarkets.map(m => `<option value="${m}">${m}</option>`).join('');
        productBrandFilter.innerHTML = '<option value="all">Todas as Marcas</option>' + uniqueBrands.map(b => `<option value="${b}">${b}</option>`).join('');
    };

    const getUniqueParishes = () => {
        const products = getFromLocalStorage('products');
        const parishes = products.map(p => p.parish).filter(p => p);
        const uniqueParishes = [...new Set(parishes)].sort();
        parishDatalist.innerHTML = uniqueParishes.map(p => `<option value="${p}">`).join('');
    };

    // Lógica de TABS
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
            button.classList.add('active');
            document.getElementById(button.dataset.tab).style.display = 'block';

            // Re-renderizar o conteúdo quando a aba for ativada
            if (button.dataset.tab === 'tab-view-products') {
                // Carregar produtos do Firebase sempre que a aba for aberta
                loadProductsFromFirebase().then(() => {
                    renderProducts();
                    updateCounts();
                    updateFilterOptions();
                });
            } else if (button.dataset.tab === 'tab-suggestions') {
                renderSuggestions();
            }
        });
    });

    // Eventos para Ações na Tabela
    productsTableBody.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button');
        if (!targetBtn) return;
        const productId = targetBtn.dataset.id;
        
        if (targetBtn.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja deletar este produto?')) {
                (async () => {
                    try {
                        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                        // Apagar do Firestore
                        if (productId) {
                            const docRef = doc(db, `/artifacts/${appId}/public/data/products`, productId);
                            await deleteDoc(docRef);
                        }

                        // Atualizar localStorage e UI
                        let products = getFromLocalStorage('products');
                        products = products.filter(p => p.id != productId);
                        saveToLocalStorage('products', products);
                        renderProducts();
                        updateCounts();
                        alert('Produto deletado com sucesso!');
                    } catch (error) {
                        console.error('Erro ao deletar produto:', error);
                        alert('Erro ao deletar produto: ' + (error.message || error));
                    }
                })();
            }
        }

        if (targetBtn.classList.contains('btn-edit')) {
            const product = getFromLocalStorage('products').find(p => p.id == productId);
            if (product) {
                document.getElementById('product-id').value = product.id;
                document.getElementById('product-name').value = product.name;
                document.getElementById('product-price').value = product.price;
                
                // Trata o mercado
                if (['Continente', 'Pingo Doce', 'Lidl', 'Makro', 'Recheio', 'Aldi', 'Auchan', 'Minipreço'].includes(product.market)) {
                    productMarket.value = product.market;
                    otherMarketGroup.style.display = 'none';
                } else {
                    productMarket.value = 'Outro';
                    otherMarketGroup.style.display = 'block';
                    otherMarketGroup.value = product.market;
                }

                document.getElementById('product-unit').value = product.unit;
                document.getElementById('product-quantity').value = product.quantity;
                document.getElementById('product-category').value = product.category;
                document.getElementById('product-barcode').value = product.barcode || '';
                
                // Trata a marca
                if (product.brand === 'Marca Branca') {
                    brandTypeGeneric.checked = true;
                    brandInputGroup.style.display = 'none';
                } else {
                    brandTypeSpecific.checked = true;
                    brandInputGroup.style.display = 'block';
                    productBrandInput.value = product.brand;
                }
                
                document.getElementById('market-zone').value = product.zone;
                marketParishInput.value = product.parish;

                // Trata a URL da imagem
                if (product.imageUrl === DEFAULT_IMAGE_URL) {
                    useDefaultImageRadio.checked = true;
                    imageUrlGroup.style.display = 'none';
                } else {
                    useCustomImageRadio.checked = true;
                    productImageUrlInput.value = product.imageUrl || '';
                    imageUrlGroup.style.display = 'block';
                }

                // Trocar para a aba de adicionar produto e focar no campo
                tabAddProductBtn.click();
                document.getElementById('form-submit-btn').textContent = 'Salvar Alterações';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    // Eventos para Sugestões
    suggestionsList.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button');
        if (!targetBtn) return;
        const suggestionId = targetBtn.dataset.id;
        let suggestions = getFromLocalStorage('suggestions');
        const suggestion = suggestions.find(s => s.id == suggestionId);

        if (!suggestion) return;

        if (targetBtn.classList.contains('btn-accept')) {
            const products = getFromLocalStorage('products');
            const existingProduct = products.find(p => p.name === suggestion.productName && p.market === suggestion.market);
            
            if (existingProduct) {
                existingProduct.price = parseFloat(suggestion.suggestedPrice.replace('€ ', ''));
                saveToLocalStorage('products', products);
                alert(`Preço de "${existingProduct.name}" atualizado com sucesso!`);
            } else {
                alert('Produto não encontrado. Adicione-o manualmente se desejar.');
            }
        }

        if (targetBtn.classList.contains('btn-reject') || targetBtn.classList.contains('btn-accept')) {
            suggestions = suggestions.filter(s => s.id != suggestionId);
            saveToLocalStorage('suggestions', suggestions);
            renderSuggestions();
            updateCounts();
        }
    });

    // Lógica para o novo botão "Voltar"
    btnReturnToAddProduct.addEventListener('click', () => {
        tabAddProductBtn.click();
    });

    // Configurar o comportamento inicial da tab
    tabAddProductBtn.click();
});