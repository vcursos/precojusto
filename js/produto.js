// js/produto.js

import { db, collection, onSnapshot } from './firebase-init.js';

let products = [];
let prices = [];

const appContainer = document.getElementById('app-container');

// Função de Navegação
window.navigateTo = (url) => {
    window.location.href = url;
};

function render() {
    console.log('📦 Produtos carregados:', products.length);
    
    if (products.length === 0) {
        appContainer.innerHTML = `<div class="p-6 text-center text-gray-500 font-bold">A carregar detalhes...</div>`;
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    console.log('🔍 Procurando produto com ID:', productId);
    
    const product = products.find(p => p.id === productId);
    console.log('✅ Produto encontrado:', product);

    if (!product) {
        appContainer.innerHTML = `<div class="p-8 text-center text-red-500 font-bold">Produto não encontrado.</div>`;
        return;
    }

    const productPrices = prices.filter(p => p.productId === product.id).sort((a, b) => a.price - b.price);

    const pricesHtml = productPrices.map((price, index) => `
        <div class="price-card p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                        ${index + 1}
                    </div>
                    <div>
                        <div class="font-semibold text-gray-900">${price.supermarket}</div>
                        <div class="text-sm text-gray-500">${price.location || 'Localização não especificada'}</div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-2xl font-bold text-indigo-600">€${price.price.toFixed(2).replace('.', ',')}</span>
                    ${index === 0 ? '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Melhor</span>' : ''}
                </div>
            </div>
        </div>
    `).join('');

    appContainer.innerHTML = `
        <!-- Header com botão voltar -->
        <div class="bg-white p-4 rounded-lg container-shadow mb-6">
            <button onclick="navigateTo('index.html')" class="text-indigo-600 hover:underline flex items-center gap-2">
                <i class="fas fa-arrow-left"></i>
                <span>Voltar</span>
            </button>
        </div>

        <!-- Informações principais do produto -->
        <div class="bg-white rounded-lg container-shadow overflow-hidden">
            <!-- Header do produto com imagem e info básica -->
            <div class="p-6">
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Imagem do produto -->
                    <div class="flex-shrink-0">
                        <img src="${product.imageUrl || 'https://via.placeholder.com/200x200'}" 
                             alt="${product.name}" 
                             class="w-full md:w-48 h-48 object-cover rounded-lg border">
                    </div>
                    
                    <!-- Informações básicas -->
                    <div class="flex-1">
                        <h1 class="text-2xl md:text-3xl font-bold mb-4">${product.name}</h1>
                        
                        <!-- Grid de informações -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                            ${product.barcode ? `
                            <div class="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                <div class="text-xs font-semibold text-blue-700 uppercase tracking-wide">Código de Barras</div>
                                <div class="text-sm font-mono text-blue-900 mt-1">${product.barcode}</div>
                            </div>` : ''}
                            
                            <div class="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                <div class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Mercado</div>
                                <div class="text-sm text-gray-900 mt-1">${product.market || '—'}</div>
                            </div>
                            
                            ${product.brand ? `
                            <div class="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                                <div class="text-xs font-semibold text-purple-700 uppercase tracking-wide">Marca</div>
                                <div class="text-sm text-purple-900 mt-1">${product.brand}</div>
                            </div>` : ''}
                            
                            ${product.category ? `
                            <div class="bg-green-50 border border-green-200 p-3 rounded-lg">
                                <div class="text-xs font-semibold text-green-700 uppercase tracking-wide">Categoria</div>
                                <div class="text-sm text-green-900 mt-1">${product.category}</div>
                            </div>` : ''}
                            
                            <div class="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                                <div class="text-xs font-semibold text-orange-700 uppercase tracking-wide">Unidade</div>
                                <div class="text-sm text-orange-900 mt-1">${product.quantity || '1'} ${product.unit || 'unidade'}</div>
                            </div>
                            
                            ${product.zone ? `
                            <div class="bg-indigo-50 border border-indigo-200 p-3 rounded-lg">
                                <div class="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Zona</div>
                                <div class="text-sm text-indigo-900 mt-1">${product.zone}</div>
                            </div>` : ''}
                        </div>
                        
                        <!-- Botões de ação -->
                        <div class="flex flex-wrap gap-3">
                            <button onclick="toggleFavorite('${product.id}')" class="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                                <i class="fas fa-heart"></i>
                                <span class="hidden sm:inline">Favorito</span>
                            </button>
                            
                            <button onclick="addToCart('${product.id}')" class="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                                <i class="fas fa-shopping-cart"></i>
                                <span class="hidden sm:inline">Carrinho</span>
                            </button>
                            
                            <button onclick="suggestPrice('${product.id}')" class="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                                <i class="fas fa-tag"></i>
                                <span class="hidden sm:inline">Sugerir Preço</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                ${product.description ? `
                <div class="mt-6 p-4 bg-gray-50 rounded-lg border">
                    <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Descrição</h3>
                    <p class="text-gray-800 leading-relaxed">${product.description}</p>
                </div>` : ''}
            </div>
        </div>

        <!-- Seção de preços -->
        <div class="bg-white mt-6 rounded-lg container-shadow overflow-hidden">
            <div class="p-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h3 class="text-xl font-semibold mb-2 sm:mb-0">Preços para comparar</h3>
                    <button onclick="window.scrollTo({top: 0, behavior: 'smooth'})" 
                            class="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <i class="fas fa-balance-scale"></i>
                        <span>Comparar</span>
                    </button>
                </div>
                
                ${pricesHtml.length > 0 ? `
                <div class="space-y-3">
                    ${pricesHtml}
                </div>
                ` : `
                <div class="text-center py-8">
                    <i class="fas fa-search-dollar text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 mb-4">Nenhum preço encontrado para este produto.</p>
                    <button onclick="suggestPrice('${product.id}')" 
                            class="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                        Sugerir Primeiro Preço
                    </button>
                </div>
                `}
            </div>
        </div>
    `;
}

// Funções de interação
window.toggleFavorite = (productId) => {
    const favorites = JSON.parse(localStorage.getItem('favoriteProducts')) || [];
    const index = favorites.indexOf(productId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('💔 Produto removido dos favoritos', 'info');
    } else {
        favorites.push(productId);
        showToast('❤️ Produto adicionado aos favoritos!', 'success');
    }
    
    localStorage.setItem('favoriteProducts', JSON.stringify(favorites));
};

window.addToCart = (productId) => {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showToast('🛒 Quantidade atualizada no carrinho', 'info');
    } else {
        cart.push({ productId, quantity: 1, addedAt: Date.now() });
        showToast('🛒 Produto adicionado ao carrinho!', 'success');
    }
    
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
};

window.suggestPrice = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const price = prompt(`💰 Sugerir preço para "${product.name}":\n\nDigite o preço em euros (ex: 2.50):`);
    
    if (price && !isNaN(parseFloat(price))) {
        const suggestion = {
            productId,
            productName: product.name,
            price: parseFloat(price),
            suggestedAt: Date.now(),
            status: 'pending'
        };
        
        const suggestions = JSON.parse(localStorage.getItem('priceSuggestions')) || [];
        suggestions.push(suggestion);
        localStorage.setItem('priceSuggestions', JSON.stringify(suggestions));
        
        showToast('✅ Sugestão de preço enviada! Obrigado pela contribuição.', 'success');
    } else if (price !== null) {
        showToast('❌ Preço inválido. Digite apenas números (ex: 2.50)', 'error');
    }
};

// Função para mostrar toasts/notificações
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`;
    
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-black'
    };
    
    toast.className += ` ${colors[type] || colors.info}`;
    toast.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="text-sm font-medium">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg leading-none">&times;</button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animação de entrada
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // Remover automaticamente após 4 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// Inicia a aplicação
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
onSnapshot(collection(db, `/artifacts/${appId}/public/data/products`), snapshot => {
    products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    render();
});
onSnapshot(collection(db, `/artifacts/${appId}/public/data/prices`), snapshot => {
    prices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    render();
});