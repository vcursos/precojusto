// js/index.js

import { db, collection, onSnapshot } from './firebase-init.js';

// Variáveis de estado
let products = [];
let prices = [];
let searchQuery = '';
let favoriteIds = JSON.parse(localStorage.getItem('favoriteProducts')) || [];

const appContainer = document.getElementById('app-container');
const favoritesContainer = document.getElementById('favorites-section');

// Função de Navegação
window.navigateTo = (url) => {
    window.location.href = url;
};

// Função de Pesquisa por Nome
window.handleSearch = (event) => {
    searchQuery = event.target.value.toLowerCase();
    renderProducts();
};

// Função de Pesquisa por Código de Barras (CLONE EXATO da função handleSearch)
window.handleBarcodeSearch = (event) => {
    searchQuery = event.target.value.toLowerCase();
    renderProducts();
};

// Gerencia Favoritos
window.toggleFavorite = (productId) => {
    const index = favoriteIds.indexOf(productId);
    if (index > -1) {
        favoriteIds.splice(index, 1); // Remove
    } else {
        favoriteIds.push(productId); // Adiciona
    }
    localStorage.setItem('favoriteProducts', JSON.stringify(favoriteIds));
    render(); // Re-renderiza tudo para atualizar a lista de favoritos e os ícones
};


// Configura os listeners de dados do Firestore
function setupFirestoreListeners() {
    console.log('🔥 Configurando listeners do Firebase...');

    // Tentar múltiplos caminhos para encontrar os produtos
    const possiblePaths = [
        'products',
        'public/data/products',
        'artifacts/default-app-id/public/data/products',
        'precomercado/products'
    ];

    // Primeiro, tentar o caminho mais simples
    console.log('📡 Tentando carregar produtos do Firebase...');
    onSnapshot(collection(db, 'products'), (snapshot) => {
        console.log(`📦 Produtos recebidos: ${snapshot.docs.length}`);
        if (snapshot.docs.length === 0) {
            console.log('⚠️ Nenhum produto encontrado na coleção "products"');
            // Tentar outro caminho
            tryAlternatePaths();
            return;
        }
        products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Salvar produtos no localStorage para compatibilidade com script.js
        const productsForStorage = products.map(product => {
            const productPrices = prices.filter(p => p.productId === product.id);
            const cheapestPrice = productPrices.length > 0 ? Math.min(...productPrices.map(p => p.price)) : product.price || '0.00';
            const cheapestMarket = productPrices.length > 0 ? productPrices.find(p => p.price === cheapestPrice).supermarket : 'Desconhecido';

            // Construir unidade completa: quantidade + unidade de medida
            const fullUnit = product.unit ? `${product.quantity || '1'} ${product.unit}` : (product.quantity || '1') + ' unidade';

            return {
                id: product.id,
                name: product.name || 'Produto sem nome',
                brand: product.brand || 'Marca Branca',
                price: cheapestPrice.toString(),
                market: cheapestMarket,
                category: product.category || 'Geral',
                imageUrl: product.imageUrl || product.image || "https://png.pngtree.com/png-vector/20241025/ourmid/png-tree-grocery-cart-filled-with-fresh-vegetables-png-image_14162473.png",
                barcode: product.barcode || '',
                unit: fullUnit,
                country: product.zone || '',
                quantity: product.quantity || '1'
            };
        });

        localStorage.setItem('products', JSON.stringify(productsForStorage));

        // Disparar evento para script.js atualizar
        if (typeof window.renderProducts === 'function') {
            window.renderProducts();
        }

        render();
    }, (error) => {
        console.error('❌ Erro ao carregar produtos:', error);
        tryAlternatePaths();
    });
}

// Função para tentar caminhos alternativos
function tryAlternatePaths() {
    console.log('🔄 Tentando caminhos alternativos...');

    // Tentar caminho com artifacts
    const appId = 'default-app-id';
    onSnapshot(collection(db, `/artifacts/${appId}/public/data/products`), (snapshot) => {
        console.log(`📦 Produtos (artifacts): ${snapshot.docs.length}`);
        if (snapshot.docs.length > 0) {
            handleProductsSnapshot(snapshot);
        }
    }, (error) => {
        console.error('❌ Erro no caminho artifacts:', error);
        // Se ainda não funcionar, criar produtos de exemplo
        createFallbackProducts();
    });
}

// Função para lidar com snapshot de produtos
function handleProductsSnapshot(snapshot) {
    products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Salvar produtos no localStorage para compatibilidade com script.js
    const productsForStorage = products.map(product => {
        const productPrices = prices.filter(p => p.productId === product.id);
        const cheapestPrice = productPrices.length > 0 ? Math.min(...productPrices.map(p => p.price)) : product.price || '0.00';
        const cheapestMarket = productPrices.length > 0 ? productPrices.find(p => p.price === cheapestPrice).supermarket : 'Desconhecido';

        // Construir unidade completa: quantidade + unidade de medida
        const fullUnit = product.unit ? `${product.quantity || '1'} ${product.unit}` : (product.quantity || '1') + ' unidade';

        return {
            id: product.id,
            name: product.name || 'Produto sem nome',
            brand: product.brand || 'Marca Branca',
            price: cheapestPrice.toString(),
            market: cheapestMarket,
            category: product.category || 'Geral',
            imageUrl: product.imageUrl || product.image || "https://png.pngtree.com/png-vector/20241025/ourmid/png-tree-grocery-cart-filled-with-fresh-vegetables-png-image_14162473.png",
            barcode: product.barcode || '',
            unit: fullUnit,
            country: product.zone || '',
            quantity: product.quantity || '1'
        };
    });

    localStorage.setItem('products', JSON.stringify(productsForStorage));
    console.log(`✅ ${productsForStorage.length} produtos salvos no localStorage`);

    // Disparar evento para script.js atualizar
    if (typeof window.renderProducts === 'function') {
        window.renderProducts();
    }

    render();
}

// Produtos de fallback se Firebase não funcionar
function createFallbackProducts() {
    console.log('🔄 Criando produtos de exemplo...');
    const fallbackProducts = [
        {
            id: 'fb_1',
            name: 'Arroz Agulha',
            brand: 'Marca Branca',
            price: '1.50',
            market: 'Pingo Doce',
            category: 'Cereais',
            imageUrl: 'https://png.pngtree.com/png-vector/20241025/ourmid/png-tree-grocery-cart-filled-with-fresh-vegetables-png-image_14162473.png',
            barcode: '1234567890123',
            unit: '1kg',
            country: 'Portugal'
        },
        {
            id: 'fb_2',
            name: 'Leite Meio Gordo',
            brand: 'Agros',
            price: '1.20',
            market: 'Continente',
            category: 'Laticínios',
            imageUrl: 'https://png.pngtree.com/png-vector/20241025/ourmid/png-tree-grocery-cart-filled-with-fresh-vegetables-png-image_14162473.png',
            barcode: '1234567890124',
            unit: '1L',
            country: 'Portugal'
        }
    ];

    localStorage.setItem('products', JSON.stringify(fallbackProducts));
    console.log('✅ Produtos de fallback criados');

    if (typeof window.renderProducts === 'function') {
        window.renderProducts();
    }
}

// Renderiza a lista de produtos
function renderProducts() {
    const productListContainer = document.getElementById('product-list');
    if (!productListContainer) return;

    const productsWithPrices = products.map(product => {
        const productPrices = prices.filter(p => p.productId === product.id);
        const cheapestPrice = productPrices.length > 0 ? Math.min(...productPrices.map(p => p.price)) : null;
        const cheapestMarket = cheapestPrice !== null ? productPrices.find(p => p.price === cheapestPrice).supermarket : 'N/D';

        return { ...product, cheapestPrice, cheapestMarket };
    }).sort((a, b) => (a.cheapestPrice === null) - (b.cheapestPrice === null) || a.cheapestPrice - b.cheapestPrice);

    const filteredProducts = productsWithPrices.filter(product => {
        // Se searchQuery estiver vazio, mostrar todos os produtos
        if (!searchQuery || searchQuery.trim() === '') {
            return true;
        }

        const nameMatch = product.name.toLowerCase().includes(searchQuery);
        const barcodeMatch = product.barcode && product.barcode.toString().includes(searchQuery);
        const matches = nameMatch || barcodeMatch;

        // Log apenas para debug quando necessário
        // if (matches) console.log('✅ Produto encontrado:', product.name, 'barcode:', product.barcode);

        return matches;
    });

    if (filteredProducts.length === 0) {
        // Verificar se a busca parece ser um código de barras (só números, 8+ dígitos)
        const looksLikeBarcode = searchQuery && /^\d{8,}$/.test(searchQuery.trim());

        let message = '<div class="col-span-full text-center p-8">';

        if (looksLikeBarcode) {
            message += `
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div class="text-yellow-800 mb-3">
                        <i class="fas fa-search text-2xl mb-2"></i>
                        <h3 class="text-lg font-semibold">Produto não encontrado pelo código de barras</h3>
                    </div>
                    <p class="text-yellow-700 mb-4">
                        Não encontramos nenhum produto com o código <strong>${searchQuery}</strong>
                    </p>
                    <div class="bg-white border border-yellow-300 rounded p-4">
                        <p class="text-yellow-800 font-medium mb-2">💡 Sugestões:</p>
                        <ul class="text-yellow-700 text-left list-none space-y-1">
                            <li>• Verifique se o código está correto</li>
                            <li>• Tente pesquisar pelo <strong>nome do produto</strong></li>
                            <li>• Use palavras-chave como "chocolate", "leite", etc.</li>
                        </ul>
                    </div>
                </div>
            `;
        } else {
            message += `
                <div class="text-gray-500">
                    <i class="fas fa-search text-3xl mb-3 text-gray-400"></i>
                    <h3 class="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                    <p>Tente pesquisar com palavras diferentes ou verifique a ortografia.</p>
                </div>
            `;
        }

        message += '</div>';
        productListContainer.innerHTML = message;
        return;
    }

    productListContainer.innerHTML = filteredProducts.map(product => {
        const priceText = product.cheapestPrice !== null ? `€${product.cheapestPrice.toFixed(2).replace('.', ',')}` : 'Indisponível';
        const isFavorite = favoriteIds.includes(product.id);

        return `
            <div class="bg-white p-4 rounded-lg container-shadow flex flex-col justify-between relative">
                <div onclick="navigateTo('produto.html?id=${product.id}')" class="cursor-pointer">
                    <img src="${product.imageUrl || 'https://via.placeholder.com/150'}" alt="${product.name}" class="w-full h-32 object-cover rounded-md mb-3">
                    <h3 class="font-bold text-md">${product.name} <span class="text-sm font-normal text-gray-500">(${product.unit || 'Un'})</span></h3>
                    <p class="text-sm text-gray-600">${product.cheapestMarket}</p>
                </div>
                <div class="flex justify-between items-center mt-3">
                    <span class="text-lg font-bold text-indigo-600">${priceText}</span>
                    <button onclick="toggleFavorite('${product.id}')" class="text-2xl transition-transform transform hover:scale-125">
                        ${isFavorite ? '⭐' : '☆'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}


// Renderiza a seção de favoritos
function renderFavorites() {
    if (!favoritesContainer) return;

    const favoriteProducts = products
        .filter(p => favoriteIds.includes(p.id))
        .map(product => {
            const productPrices = prices.filter(pr => pr.productId === product.id);
            const cheapestPrice = productPrices.length > 0 ? Math.min(...productPrices.map(pr => pr.price)) : 0;
            const cheapestMarket = cheapestPrice > 0 ? productPrices.find(p => p.price === cheapestPrice).supermarket : 'N/D';
            return { ...product, cheapestPrice, cheapestMarket };
        });

    if (favoriteProducts.length === 0) {
        favoritesContainer.innerHTML = `
            <h2 class="text-2xl font-bold mb-4">Meus Favoritos</h2>
            <p class="text-gray-500 text-center bg-white p-4 rounded-lg">Você ainda não adicionou produtos aos favoritos. Clique na estrela ☆ de um produto para adicioná-lo aqui.</p>
        `;
        return;
    }

    let totalPrice = 0;
    const favoritesHtml = favoriteProducts.map(product => {
        totalPrice += product.cheapestPrice;
        return `
            <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div class="flex items-center gap-3">
                    <img src="${product.imageUrl || 'https://via.placeholder.com/50'}" alt="${product.name}" class="w-10 h-10 object-cover rounded-md">
                    <div>
                        <p class="font-semibold">${product.name} <span class="text-sm font-normal">(${product.unit || 'Un'})</span></p>
                        <p class="text-sm text-gray-500">${product.cheapestMarket}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="font-bold text-indigo-600">€${product.cheapestPrice.toFixed(2).replace('.', ',')}</span>
                    <button onclick="toggleFavorite('${product.id}')" class="text-red-500 hover:text-red-700 font-bold">✕</button>
                </div>
            </div>
        `;
    }).join('');

    favoritesContainer.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Meus Favoritos</h2>
        <div class="bg-white p-4 rounded-lg container-shadow">
            <div class="space-y-3 mb-4">
                ${favoritesHtml}
            </div>
            <div class="border-t pt-4 flex justify-between items-center">
                <span class="text-lg font-bold">VALOR TOTAL:</span>
                <span class="text-2xl font-extrabold text-indigo-600">€${totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>
        </div>
    `;
}

// Função principal de renderização
function render() {
    renderFavorites();
    renderProducts();
}

// Scanner duplicado removido (BarcodeScanner). A lógica única de scanner permanece em `barcode-scanner.js` / `script.js`.
// Inicialização de eventos de pesquisa.
document.addEventListener('DOMContentLoaded', () => {

    // Configurar botão de pesquisa principal
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('product-search-bar');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔍 Botão de pesquisa clicado, valor:', searchInput.value);

            // Mostrar animação de carregamento
            const originalText = searchButton.innerHTML;
            searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Pesquisando...';
            searchButton.disabled = true;

            // Simular delay para mostrar a animação
            setTimeout(() => {
                // Chamar diretamente a função handleSearch
                if (window.handleSearch) {
                    window.handleSearch({ target: searchInput });
                }

                // Restaurar botão após pesquisa
                setTimeout(() => {
                    searchButton.innerHTML = originalText;
                    searchButton.disabled = false;
                }, 300);
            }, 500);
        });

        // Também permitir pesquisa com Enter (com animação)
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('🔍 Enter pressionado na busca principal, valor:', searchInput.value);

                // Mostrar animação de carregamento no botão
                const originalText = searchButton.innerHTML;
                searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Pesquisando...';
                searchButton.disabled = true;

                // Simular delay para mostrar a animação
                setTimeout(() => {
                    // Chamar diretamente a função handleSearch
                    if (window.handleSearch) {
                        window.handleSearch({ target: searchInput });
                    }

                    // Restaurar botão após pesquisa
                    setTimeout(() => {
                        searchButton.innerHTML = originalText;
                        searchButton.disabled = false;
                    }, 300);
                }, 500);
            }
        });

        console.log('✅ Eventos de pesquisa principal configurados');
    }

    console.log('✅ Campo de pesquisa por código de barras configurado (event listeners no script.js)');
});

// Inicializar Firebase quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 Inicializando Firebase listeners...');
    setupFirestoreListeners();
});

// Adicionar CSS da animação
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        20% { opacity: 1; transform: translateX(-50%) translateY(0); }
        80% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(style);

// Inicia a aplicação
setupFirestoreListeners();

// Removido listener de load para scanner duplicado.
