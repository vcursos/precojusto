// Firebase Loader - Versão Simplificada
import { db } from './firebase-init.js';
import { collection, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Função para carregar produtos do Firebase
async function loadProductsFromFirebase() {
    console.log('🔥 Iniciando carregamento do Firebase...');

    try {
        // Tentar diferentes caminhos para encontrar os produtos
        const possibleCollections = [
            'products',
            'public/data/products',
            'artifacts/default-app-id/public/data/products'
        ];

        for (const collectionPath of possibleCollections) {
            try {
                console.log(`📡 Tentando coleção: ${collectionPath}`);
                const snapshot = await getDocs(collection(db, collectionPath));

                if (!snapshot.empty) {
                    console.log(`✅ Encontrados ${snapshot.docs.length} produtos em: ${collectionPath}`);

                    const products = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const rawQuantity = data.quantity ?? data.qty ?? data.amount ?? data.size ?? '';
                        const quantity = rawQuantity !== undefined && rawQuantity !== null ? String(rawQuantity).trim() : '';
                        const rawUnit = data.unit ?? data.measure ?? data.unitOfMeasure ?? '';
                        const unit = rawUnit ? String(rawUnit).trim() : '';
                        const country = (data.country || data.zone || data.countryOfOrigin || data.origin || '').toString().trim();
                        const barcode = (data.barcode || data.ean || data.gtin || '').toString().trim();
                        const unitDisplay = quantity && unit ? `${quantity} ${unit}`.trim() : (unit || quantity);

                        return {
                            id: doc.id,
                            name: data.name || 'Produto sem nome',
                            brand: data.brand || 'Marca Branca',
                            price: data.price?.toString() || '0.00',
                            market: data.market || data.supermarket || 'Desconhecido',
                            category: data.category || 'Geral',
                            imageUrl: data.imageUrl || data.image || "https://png.pngtree.com/png-vector/20241025/ourmid/png-tree-grocery-cart-filled-with-fresh-vegetables-png-image_14162473.png",
                            barcode: barcode,
                            unit,
                            quantity,
                            unitDisplay: unitDisplay || '',
                            country
                        };
                    });

                    // Salvar no localStorage
                    localStorage.setItem('products', JSON.stringify(products));
                    console.log(`💾 ${products.length} produtos salvos no localStorage`);

                    // Atualizar interface - múltiplas tentativas
                    console.log('🔄 Tentando atualizar interface...');

                    const updateInterface = () => {
                        if (typeof window.renderProducts === 'function') {
                            window.renderProducts();
                            console.log('✅ Interface atualizada com produtos do Firebase');
                        } else {
                            console.log('⚠️ window.renderProducts não disponível ainda');
                        }
                    };

                    // Tentar imediatamente
                    updateInterface();

                    // Tentar após delays progressivos
                    setTimeout(updateInterface, 100);
                    setTimeout(updateInterface, 500);
                    setTimeout(updateInterface, 1000);

                    // Disparar evento customizado
                    window.dispatchEvent(new CustomEvent('productsLoaded', {
                        detail: { products, source: 'firebase' }
                    }));

                    return; // Sucesso, parar aqui
                }
            } catch (error) {
                console.log(`❌ Erro na coleção ${collectionPath}:`, error.message);
            }
        }

        // Se chegou aqui, nenhuma coleção funcionou
        console.log('⚠️ Nenhuma coleção de produtos encontrada, criando produtos de exemplo...');
        createFallbackProducts();

    } catch (error) {
        console.error('❌ Erro geral no Firebase:', error);
        createFallbackProducts();
    }
}

// Produtos de fallback
function createFallbackProducts() {
    const fallbackProducts = [
        {
            id: 'sample_1',
            name: 'Arroz Carolino',
            brand: 'Marca Branca',
            price: '1.50',
            market: 'Pingo Doce',
            category: 'Cereais',
            imageUrl: 'https://png.pngtree.com/png-vector/20241025/ourmid/png-tree-grocery-cart-filled-with-fresh-vegetables-png-image_14162473.png',
            barcode: '1234567890123',
            quantity: '1',
            unit: 'kg',
            unitDisplay: '1 kg',
            country: ''
        },
        {
            id: 'sample_2',
            name: 'Leite Meio Gordo',
            brand: 'Agros',
            price: '1.20',
            market: 'Continente',
            category: 'Laticínios',
            imageUrl: 'https://png.pngtree.com/png-vector/20241025/ourmid/png-tree-grocery-cart-filled-with-fresh-vegetables-png-image_14162473.png',
            barcode: '1234567890124',
            quantity: '1',
            unit: 'L',
            unitDisplay: '1 L',
            country: ''
        },
        {
            id: 'sample_3',
            name: 'Pão de Forma',
            brand: 'Marca Branca',
            price: '0.85',
            market: 'Pingo Doce',
            category: 'Padaria',
            imageUrl: 'https://png.pngtree.com/png-vector/20241025/ourmid/png-tree-grocery-cart-filled-with-fresh-vegetables-png-image_14162473.png',
            barcode: '1234567890125',
            quantity: '1',
            unit: 'unidade',
            unitDisplay: '1 unidade',
            country: ''
        }
    ];

    localStorage.setItem('products', JSON.stringify(fallbackProducts));
    console.log('✅ Produtos de exemplo criados');

    // Atualizar interface com múltiplas tentativas
    const updateInterface = () => {
        if (typeof window.renderProducts === 'function') {
            window.renderProducts();
            console.log('✅ Interface atualizada com produtos de exemplo');
        } else {
            console.log('⚠️ window.renderProducts não disponível para fallback');
        }
    };

    // Tentar múltiplas vezes
    updateInterface();
    setTimeout(updateInterface, 100);
    setTimeout(updateInterface, 500);
    setTimeout(updateInterface, 1000);
}

// Função para verificar se deve carregar produtos
function shouldLoadProducts() {
    const existingProducts = localStorage.getItem('products');
    if (!existingProducts) {
        console.log('📦 Nenhum produto no localStorage, carregando...');
        return true;
    }

    try {
        const products = JSON.parse(existingProducts);
        if (!products || products.length === 0) {
            console.log('📦 Lista de produtos vazia, carregando...');
            return true;
        }
        console.log(`📦 Já existem ${products.length} produtos no localStorage`);
        return false;
    } catch (error) {
        console.log('📦 Erro ao ler produtos existentes, recarregando...', error);
        return true;
    }
}

// Múltiplas tentativas de inicialização
function initializeFirebaseLoader() {
    console.log('🚀 Firebase Loader iniciando...');

    // Carregar sempre, independente de existir no localStorage
    loadProductsFromFirebase();
}

// Tentar múltiplas formas de inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebaseLoader);
} else {
    // DOM já carregado
    initializeFirebaseLoader();
}

// Backup: tentar após um delay também
setTimeout(() => {
    console.log('⏰ Tentativa de backup do Firebase Loader...');
    if (shouldLoadProducts()) {
        loadProductsFromFirebase();
    }
}, 1000);

// Backup adicional: tentar quando a janela carregar completamente
window.addEventListener('load', () => {
    console.log('🌐 Window load - verificando produtos...');
    if (shouldLoadProducts()) {
        setTimeout(() => {
            loadProductsFromFirebase();
        }, 200);
    }
});

export { loadProductsFromFirebase };
