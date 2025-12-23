import {
    db,
    auth,
    appId,
    isAuthReady,
    collection,
    onSnapshot,
    onAuthStateChanged
} from './firebase-init.js';

let searchQuery = '';
let products = [];
let prices = [];

// Função de inicialização
function init() {
    onAuthStateChanged(auth, user => {
        if (isAuthReady) {
            const productsRef = collection(db, `/artifacts/${appId}/public/data/products`);
            onSnapshot(productsRef, (snapshot) => {
                products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                render();
            });

            const pricesRef = collection(db, `/artifacts/${appId}/public/data/prices`);
            onSnapshot(pricesRef, (snapshot) => {
                prices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                render();
            });
        }
    });
}

// Funções de navegação e busca
function navigateTo(url) {
    window.location.href = url;
}

function handleSearch(event) {
    searchQuery = event.target.value.toLowerCase();
    render();
}

// Sincroniza produtos e preços para a visualização
function syncProductsAndPrices() {
    const productsAndPrices = products.map(product => {
        const productPrices = prices.filter(p => p.productId === product.id);
        const cheapestPrice = productPrices.length > 0 ? Math.min(...productPrices.map(p => p.price)) : null;
        return {
            ...product,
            prices: productPrices,
            cheapestPrice: cheapestPrice
        };
    }).sort((a, b) => (a.cheapestPrice === null) - (b.cheapestPrice === null) || a.cheapestPrice - b.cheapestPrice);
    return productsAndPrices;
}

// Renderização da interface do utilizador
function render() {
    const appContainer = document.getElementById('app-container');

    if (!isAuthReady) {
        // Se a autenticação não estiver pronta, não renderiza nada
        return;
    }

    const productsAndPrices = syncProductsAndPrices();
    const filteredProducts = productsAndPrices.filter(product =>
        product.name.toLowerCase().includes(searchQuery)
    );

    const productListHtml = filteredProducts.map(product => `
        <div class="product-card bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between transform transition-transform hover:scale-105">
            <h2 class="text-xl font-bold mb-2">${product.name}</h2>
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover rounded-md mb-4">` : ''}
            <p class="text-gray-600 mb-4">${product.description || 'Sem descrição.'}</p>
            <div class="mt-auto">
                <span class="text-2xl font-bold text-indigo-600">
                    ${product.cheapestPrice !== null ? `€${product.cheapestPrice.toFixed(2).replace('.', ',')}` : 'N/A'}
                </span>
                <button onclick="navigateTo('produto.html?id=${product.id}')"
                    class="mt-4 w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-indigo-600 transition-colors">
                    Comparar Preços
                </button>
            </div>
        </div>
    `).join('');

    appContainer.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg">
            <h1 class="text-4xl font-extrabold text-center mb-6 text-gradient">Comparador de Preços</h1>
            
            <input type="text" id="search-input" oninput="handleSearch(event)" placeholder="Procurar produtos..."
                class="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500 transition">
            
            <div id="product-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                ${productListHtml.length > 0 ? productListHtml : '<p class="text-center text-gray-500 col-span-full">Nenhum produto encontrado.</p>'}
            </div>

            <div class="fixed bottom-4 right-4 z-50">
                <button onclick="navigateTo('admin.html')" class="w-14 h-14 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow">
                    Admin
                </button>
            </div>
        </div>
    `;

    // Expondo as funções para o escopo global
    Object.assign(window, { navigateTo, handleSearch });
}

// Inicia a aplicação quando a página carrega
window.onload = init;
