// ============ DECLARE initializeAppData FIRST ============
function initializeAppData() {
    console.log("Initializing app data...");
    // loadProducts removido - já é carregado pelo firebase-loader.js
    updateCartBadge();
    loadSearchHistory();
    loadFavorites();
    populateFilters();
    
    // Renderizar produtos do localStorage (já carregados pelo firebase-loader)
    if (typeof window.renderProducts === 'function') {
        window.renderProducts();
        console.log('✅ Produtos renderizados no initializeAppData');
    }
}

// Função para popular os filtros (chama updateFilterOptions quando disponível)
function populateFilters() {
    console.log('📋 Populando filtros...');
    // updateFilterOptions será chamado dentro do DOMContentLoaded
    setTimeout(() => {
        if (typeof updateFilterOptions === 'function') {
            updateFilterOptions();
            console.log('✅ Filtros atualizados');
        }
    }, 100);
}

// Função para carregar histórico de pesquisa
function loadSearchHistory() {
    console.log('📜 Carregando histórico de pesquisa...');
    setTimeout(() => {
        if (typeof renderSearchHistory === 'function') {
            renderSearchHistory();
        }
    }, 100);
}

// Função para carregar favoritos
function loadFavorites() {
    console.log('⭐ Carregando favoritos...');
    setTimeout(() => {
        if (typeof renderFavorites === 'function') {
            renderFavorites();
        }
    }, 100);
}

// Função para atualizar badge do carrinho
function updateCartBadge() {
    console.log('🛒 Atualizando badge do carrinho...');
    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Imagem placeholder leve (1x1 GIF) para permitir lazy-load sem quebrar o layout
const __PJ_PLACEHOLDER_IMG =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

// Lazy-load simples para imagens (evita disparar dezenas/centenas de requests no primeiro paint)
function __pjSetupLazyImages(root = document) {
    const imgs = Array.from(root.querySelectorAll('img[data-src]'));
    if (!imgs.length) return;

    const loadImg = (img) => {
        const src = img.getAttribute('data-src');
        if (!src) return;
        img.src = src;
        img.removeAttribute('data-src');
    };

    if (!('IntersectionObserver' in window)) {
        imgs.forEach(loadImg);
        return;
    }

    const io = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const img = entry.target;
                io.unobserve(img);
                loadImg(img);
            }
        },
        { root: null, rootMargin: '250px 0px', threshold: 0.01 }
    );

    imgs.forEach((img) => io.observe(img));
}

document.addEventListener('DOMContentLoaded', () => {
    // Definir a URL da imagem padrão
    const DEFAULT_IMAGE_URL = "https://png.pngtree.com/png-vector/20241025/ourmid/png-tree-grocery-cart-filled-with-fresh-vegetables-png-image_14162473.png";

    // Elementos do DOM
    const productsList = document.getElementById('products-list');
    const productSearchBar = document.getElementById('product-search-bar');
    const marketFilter = document.getElementById('market-filter');
    const brandFilter = document.getElementById('brand-filter');
    const categoryFilter = document.getElementById('category-filter');
    const searchHistoryList = document.getElementById('search-history-list');
    const favoritesList = document.getElementById('favorites-products-list');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalElement = document.getElementById('cart-total');
    const cartMarketFilter = document.getElementById('cart-market-filter');
    const cartMarketBreakdown = document.getElementById('cart-market-breakdown');
    const cartModal = document.getElementById('cart-modal');
    const favoritesModal = document.getElementById('favorites-modal');
    const suggestionModal = document.getElementById('suggestion-modal');
    const cartBtn = document.querySelector('a[title="Carrinho"]');
    const favoritesBtn = document.querySelector('a[title="Favoritos"]');
    const closeModalBtns = document.querySelectorAll('.close-btn');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const noFavoritesMessage = document.getElementById('no-favorites-message');
    const recentProductsList = document.getElementById('recent-products-list');
    const noRecentProductsMessage = document.getElementById('no-recent-products');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const closeFavoritesBtn = document.getElementById('close-favorites-btn');
    const clearSearchBtn = document.getElementById('clear-search');
    const historyDropdown = document.getElementById('history-dropdown');
    const clearHistoryBtn = document.getElementById('clear-history');
    const closeFavoritesBottomBtn = document.getElementById('close-favorites-bottom');

    const APP_RELEASE_FALLBACK = {
        version: '20260501-v2-icons',
        title: 'Novidades da atualização',
        notes: [
            'Novo botão de voltar contextual no modal de comparação.',
            'Retorno para a tela anterior corrigido ao sair da comparação.',
            'Ícones do app atualizados com visual mais moderno (inclui instalações antigas).',
            'Manifest e service worker versionados para forçar atualização do app instalado.',
            'Comparação de produtos melhorada por nome genérico.'
        ]
    };
    const APP_RELEASE = (window.__PJ_RELEASE__ && typeof window.__PJ_RELEASE__ === 'object')
        ? window.__PJ_RELEASE__
        : APP_RELEASE_FALLBACK;
    const APP_RELEASE_VERSION = String(APP_RELEASE.version || APP_RELEASE_FALLBACK.version);
    const APP_RELEASE_TITLE = String(APP_RELEASE.title || APP_RELEASE_FALLBACK.title);
    const APP_RELEASE_NOTES = Array.isArray(APP_RELEASE.notes) && APP_RELEASE.notes.length
        ? APP_RELEASE.notes.map(item => String(item || '').trim()).filter(Boolean)
        : APP_RELEASE_FALLBACK.notes;
    const APP_RELEASE_SEEN_KEY = 'pj-last-seen-release-version';
    
    // Elementos do modal de sugestão
    const modalSuggestionForm = document.getElementById('modal-suggestion-form');
    const modalSuggestionProductName = document.getElementById('modal-suggestion-product-name');
    const modalSuggestionMarket = document.getElementById('modal-suggestion-market');
    const modalSuggestionNewPrice = document.getElementById('modal-suggestion-new-price');
    const modalSuggestionProductId = document.getElementById('modal-suggestion-product-id');
    
    // Elementos da nova lista de produtos horizontal
    const productsSection = document.querySelector('.products-section');
    const scrollContainer = document.getElementById('products-list');
    const prevBtn = productsSection.querySelector('.prev-btn');
    const nextBtn = productsSection.querySelector('.next-btn');
    const openAllProductsPageBtn = document.getElementById('open-all-products-page');
    const allProductsPage = document.getElementById('all-products-page');
    const allProductsBackBtn = document.getElementById('all-products-back-btn');
    const allProductsBackFloatingBtn = document.getElementById('all-products-back-floating');
    const allProductsList = document.getElementById('all-products-list');
    const allProductsCount = document.getElementById('all-products-count');
    const allProductsEmpty = document.getElementById('all-products-empty');
    let allProductsPrevScrollY = 0;

    // Funções de Utilitários
    // Para dados que devem persistir (produtos, sugestões)
    const saveToLocalStorage = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    // Limpar campo de pesquisa quando o botão for clicado
    if (clearSearchBtn && productSearchBar) {
        clearSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            productSearchBar.value = '';
            const evt = new Event('input', { bubbles: true });
            productSearchBar.dispatchEvent(evt);
            productSearchBar.focus();
        });
    }

    // CLONE EXATO - Limpar campo de pesquisa por código de barras
    const clearBarcodeSearchBtn = document.getElementById('clear-barcode-search');
    const barcodeSearchBar = document.getElementById('barcode-search-bar');
    
    if (clearBarcodeSearchBtn && barcodeSearchBar) {
        clearBarcodeSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            barcodeSearchBar.value = '';
            const evt = new Event('input', { bubbles: true });
            barcodeSearchBar.dispatchEvent(evt);
            barcodeSearchBar.focus();
        });
    }

    // Mostrar dropdown de histórico ao digitar (com itens filtrados)
    const showHistoryDropdown = (query) => {
        if (!historyDropdown) return;
        const history = getFromSessionStorage('searchHistory');
        if (!history || history.length === 0) {
            historyDropdown.style.display = 'none';
            return;
        }
        const q = (query || '').toLowerCase();
        // Exclude items that are an exact match of the typed query (no autocomplete for exact-typed terms)
        const items = history.filter(h => {
            const lower = h.toLowerCase();
            if (!q) return true; // when query empty, include all
            return lower.includes(q) && lower !== q;
        });
        if (items.length === 0) {
            historyDropdown.style.display = 'none';
            return;
        }
        historyDropdown.innerHTML = items.map(i => `<div class="history-item">${i}</div>`).join('');
        historyDropdown.style.display = 'block';
    };

    // Ao clicar num item do dropdown
    if (historyDropdown) {
        historyDropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.history-item');
            if (!item) return;
            const term = item.textContent.trim();
            if (!term) return;
            // move term to front of history and save
            let history = getFromSessionStorage('searchHistory');
            history = history.filter(h => h.toLowerCase() !== term.toLowerCase());
            history.unshift(term);
            history = history.slice(0, 10);
            saveToSessionStorage('searchHistory', history);
            renderSearchHistory();
            // run search, then clear input so user can type next term
            productSearchBar.value = term;
            filterProducts();
            historyDropdown.style.display = 'none';
            if (typeof setLastSearched === 'function') setLastSearched(term);
            // keep the searched term in the input so the user can edit or clear manually
        });
    }

    const getFromLocalStorage = (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    };
    
    // Tornar disponível globalmente
    window.getFromLocalStorage = getFromLocalStorage;
    
    // Para dados da sessão do utilizador (carrinho, favoritos, histórico)
    const saveToSessionStorage = (key, data) => {
        sessionStorage.setItem(key, JSON.stringify(data));
    };

    const getFromSessionStorage = (key) => {
        const data = sessionStorage.getItem(key);
        // Retorna um array vazio por defeito para listas
        return data ? JSON.parse(data) : [];
    };
    
    // Tornar disponível globalmente
    window.getFromSessionStorage = getFromSessionStorage;


    const formatPrice = (price) => {
        return `€ ${parseFloat(price).toFixed(2)}`;
    };

    // Função para gerir a visibilidade dos botões de scroll
    const manageScrollButtons = () => {
        if (!scrollContainer || !prevBtn || !nextBtn) return;

        const isScrollable = scrollContainer.scrollWidth > scrollContainer.clientWidth;
        
        if (!isScrollable) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }
        
        const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        prevBtn.style.display = scrollContainer.scrollLeft > 0 ? 'flex' : 'none';
        nextBtn.style.display = scrollContainer.scrollLeft < maxScrollLeft - 1 ? 'flex' : 'none';
    };

    // Criação do card de produto para a exibição principal
    const createProductCard = (product, isFavorite = false) => {
        const productCard = document.createElement('div');
            productCard.classList.add('product-card', 'new-product-card');
        // expose product id for delegated handlers
        productCard.dataset.productId = product.id;

        const favButtonClass = isFavorite ? 'favorite-btn active' : 'favorite-btn';
        const marketName = (product?.market || '').toString().trim();
        const marketLogo = __pjFindMarketLogo(marketName);
        const marketMetaContent = marketLogo
            ? `<span class="market-meta-logo-wrap"><img src="${pjEsc(marketLogo)}" alt="Logo ${pjEsc(marketName || 'mercado')}" class="market-meta-logo" loading="lazy" decoding="async"></span>`
            : `<span class="market-meta-name">${pjEsc(marketName || '—')}</span>`;
        
        productCard.innerHTML = `
            <img src="${__PJ_PLACEHOLDER_IMG}"
                data-src="${product.imageUrl || DEFAULT_IMAGE_URL}"
                alt="${product.name}"
                class="product-image"
                loading="lazy"
                decoding="async">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${formatPrice(product.price)}</p>
                <p class="product-details concise compact">
                    <span class="meta-item market-meta-item"><strong>Mercado:</strong> ${marketMetaContent}</span>
                    <span class="meta-item"><strong>Marca:</strong> <span class="brand-name">${product.brand}</span></span>
                </p>
            </div>
            <div class="product-card-actions">
                <button class="${favButtonClass}" data-id="${product.id}" title="Adicionar aos Favoritos">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="add-to-cart-btn" data-id="${product.id}" title="Adicionar ao Carrinho">
                    <i class="fas fa-shopping-cart"></i>
                </button>
                <button class="suggest-price-btn" data-id="${product.id}" title="Sugerir um novo preço">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;

        // click opens detail modal (but not when clicking action buttons)
        productCard.addEventListener('click', (e) => {
            const action = e.target.closest('button');
            if (action) return; // ignore clicks on buttons (they have their own handlers)
            openProductDetail(product.id);
        });

        // suggestion button handler
        const suggestBtn = productCard.querySelector('.suggest-price-btn');
        if (suggestBtn) {
            suggestBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                const modal = document.getElementById('suggestion-modal');
                if (!modal) return;
                const idInput = document.getElementById('modal-suggestion-product-id');
                const nameInput = document.getElementById('modal-suggestion-product-name');
                const marketInput = document.getElementById('modal-suggestion-market');
                idInput.value = product.id;
                nameInput.value = product.name;
                marketInput.value = product.market || '';
                openModal(modal);
            });
        }
        // ativa lazy-load no card recém-criado
        __pjSetupLazyImages(productCard);
        return productCard;
    };

    const renderAllProductsPage = () => {
        if (!allProductsList) return;
        const allProducts = getFromLocalStorage('products')
            .slice()
            .sort((a, b) => (a?.name || '').toString().localeCompare((b?.name || '').toString(), 'pt-PT'));

        allProductsList.innerHTML = '';

        if (allProductsCount) {
            const total = allProducts.length;
            allProductsCount.textContent = `${total} ${total === 1 ? 'produto' : 'produtos'}`;
        }

        if (!allProducts.length) {
            if (allProductsEmpty) allProductsEmpty.style.display = 'block';
            return;
        }

        if (allProductsEmpty) allProductsEmpty.style.display = 'none';

        const favorites = getFromSessionStorage('favorites');
        allProducts.forEach(product => {
            const isFavorite = favorites.some(fav => fav.id === product.id);
            const card = createProductCard(product, isFavorite);
            allProductsList.appendChild(card);
        });

        __pjSetupLazyImages(allProductsList);
    };

    const openAllProductsPage = () => {
        if (!allProductsPage) return;
        allProductsPrevScrollY = window.scrollY || window.pageYOffset || 0;
        renderAllProductsPage();
        allProductsPage.style.display = 'block';
        allProductsPage.setAttribute('aria-hidden', 'false');
        document.body.classList.add('all-products-page-open');
    };

    const closeAllProductsPage = () => {
        if (!allProductsPage) return;
        allProductsPage.style.display = 'none';
        allProductsPage.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('all-products-page-open');
        window.scrollTo(0, Math.max(0, allProductsPrevScrollY || 0));
    };

    // ================================
    // Detalhes do produto (PADRÃO)
    // ================================
    // Agora o padrão é abrir um modal flutuante moderno (sem navegar para outra página)
    // para ficar mais rápido e manter a experiência consistente.

    const pjProductModal = document.getElementById('pj-product-modal');
    const pjProductModalBody = document.getElementById('pj-product-modal-body');
    const pjCloseProductModalBtn = document.getElementById('pj-close-product-modal');

    const pjEsc = (v) => {
        const s = (v ?? '').toString();
        return s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const pjOpenModal = () => {
        if (!pjProductModal) return;
        pjProductModal.classList.remove('closing');
        pjProductModal.classList.add('show');
        pjProductModal.style.display = 'flex';
        // mantém a posição atual da página (não volta para o topo ao fechar)
        lockBodyScroll();
        setTimeout(() => pjProductModal.classList.add('visible'), 10);
    };

    const pjCloseModal = () => {
        if (!pjProductModal) return;
        pjProductModal.classList.remove('visible');
        pjProductModal.classList.add('closing');
        setTimeout(() => {
            pjProductModal.classList.remove('show', 'closing');
            pjProductModal.style.display = 'none';
            unlockBodyScroll();
        }, 200);
    };

    if (pjCloseProductModalBtn) pjCloseProductModalBtn.addEventListener('click', pjCloseModal);
    if (pjProductModal) {
        pjProductModal.addEventListener('click', (e) => {
            if (e.target === pjProductModal) pjCloseModal();
        });
    }

    // Funções globais usadas por botões do modal (mantém compatibilidade)
    // OBS: importante: padronizar com o que o produto.html usa (localStorage)
    // - Favoritos: localStorage('favoriteProducts') -> array de IDs
    // - Carrinho:  localStorage('shoppingCart')     -> array { productId, quantity, addedAt }
    // - Sugestões: localStorage('priceSuggestions') -> array de sugestões

    const __pjGetFavoriteIds = () => {
        try {
            const ids = JSON.parse(localStorage.getItem('favoriteProducts') || '[]');
            return Array.isArray(ids) ? ids.map(String) : [];
        } catch (_) {
            return [];
        }
    };

    const __pjSetFavoriteIds = (ids) => {
        localStorage.setItem('favoriteProducts', JSON.stringify(ids));
    };

    const __pjGetShoppingCart = () => {
        try {
            const cart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
            return Array.isArray(cart) ? cart : [];
        } catch (_) {
            return [];
        }
    };

    const __pjSetShoppingCart = (cart) => {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    };

    const __pjUpsertPriceSuggestion = (suggestion) => {
        const normalized = {
            id: suggestion?.id || Date.now(),
            productId: suggestion?.productId || '',
            productName: suggestion?.productName || '',
            market: suggestion?.market || '',
            suggestedPrice: Number(suggestion?.price ?? suggestion?.suggestedPrice ?? 0).toFixed(2),
            date: suggestion?.date || new Date().toISOString(),
            status: suggestion?.status || 'pending',
            suggestedAt: suggestion?.suggestedAt || Date.now()
        };

        const readArray = (key) => {
            try {
                const raw = JSON.parse(localStorage.getItem(key) || '[]');
                return Array.isArray(raw) ? raw : [];
            } catch (_) {
                return [];
            }
        };
        const writeArray = (key, arr) => {
            try { localStorage.setItem(key, JSON.stringify(arr)); } catch (_) {}
        };
        const pushUnique = (arr, item) => {
            const exists = arr.some(x => String(x?.id) === String(item.id));
            if (!exists) arr.push(item);
            return arr;
        };

        // Mantém compatibilidade com o fluxo novo (priceSuggestions)
        const priceSuggestions = pushUnique(readArray('priceSuggestions'), normalized);
        writeArray('priceSuggestions', priceSuggestions);

        // Espelha também para a chave usada no admin (suggestions)
        const adminSuggestion = {
            id: normalized.id,
            productId: normalized.productId,
            productName: normalized.productName,
            market: normalized.market,
            suggestedPrice: normalized.suggestedPrice,
            date: normalized.date
        };
        const suggestions = pushUnique(readArray('suggestions'), adminSuggestion);
        writeArray('suggestions', suggestions);
    };

    const __pjNormalizeMarketName = (value) => (value || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

    const __pjFindMarketLogo = (marketName) => {
        try {
            const markets = JSON.parse(localStorage.getItem('markets') || '[]');
            if (!Array.isArray(markets) || !markets.length) return '';

            const targetRaw = (marketName || '').toString().trim();
            const target = __pjNormalizeMarketName(targetRaw);
            if (!target) return '';

            // 1) match exato normalizado
            let match = markets.find(x => __pjNormalizeMarketName(x?.name || '') === target && x?.logo);

            // 2) match aproximado (quando vem "Pingo Doce Super" vs "Pingo Doce")
            if (!match) {
                match = markets.find(x => {
                    const name = __pjNormalizeMarketName(x?.name || '');
                    if (!name || !x?.logo) return false;
                    return name.includes(target) || target.includes(name);
                });
            }

            return (match && match.logo) ? String(match.logo) : '';
        } catch (_) {
            return '';
        }
    };

    const __pjNormalizeCountryName = (value) => (value || '').toString().trim().replace(/\s+/g, ' ');
    const __pjNormalizeCountryCode = (value) => (value || '').toString().trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
    const __pjCountryCodeByName = {
        portugal: 'PT',
        espanha: 'ES',
        spain: 'ES',
        brasil: 'BR',
        brazil: 'BR',
        franca: 'FR',
        frança: 'FR',
        france: 'FR',
        italia: 'IT',
        itália: 'IT',
        italy: 'IT',
        alemanha: 'DE',
        germany: 'DE',
        uk: 'GB',
        'reino unido': 'GB',
        usa: 'US',
        'estados unidos': 'US',
        'united states': 'US'
    };
    const __pjCountryNameByCode = {
        PT: 'Portugal',
        ES: 'Espanha',
        BR: 'Brasil',
        FR: 'França',
        IT: 'Itália',
        DE: 'Alemanha',
        GB: 'Reino Unido',
        US: 'Estados Unidos'
    };
    const __pjResolveCountryCode = (code, name = '') => {
        const normalizedCode = __pjNormalizeCountryCode(code);
        if (normalizedCode) return normalizedCode;
        const key = __pjNormalizeCountryName(name).toLowerCase();
        return __pjCountryCodeByName[key] || '';
    };
    const __pjResolveCountryName = (name, code = '') => {
        const rawName = __pjNormalizeCountryName(name);
        const prefixedMatch = rawName.match(/^([A-Za-z]{2})[\s\-:]+(.+)$/);
        const inferredCode = prefixedMatch ? __pjNormalizeCountryCode(prefixedMatch[1]) : '';
        const normalizedCode = __pjResolveCountryCode(code || inferredCode, rawName);
        const cleanName = prefixedMatch ? __pjNormalizeCountryName(prefixedMatch[2]) : rawName;

        if (cleanName && cleanName.length !== 2) return cleanName;
        return __pjCountryNameByCode[normalizedCode] || cleanName || rawName;
    };
    const __pjCountryCodeToFlagEmoji = (code) => {
        const normalized = __pjNormalizeCountryCode(code);
        if (normalized.length !== 2) return '';
        return String.fromCodePoint(...normalized.split('').map(c => 127397 + c.charCodeAt(0)));
    };
    const __pjPickFlagWidth = (targetSize = 20) => {
        const allowed = [16, 20, 24, 32, 40, 48, 64];
        const target = Math.max(16, Number(targetSize) || 20);
        const exactOrNext = allowed.find(size => size >= target);
        return exactOrNext || allowed[allowed.length - 1];
    };
    const __pjCountryFlagImageUrl = (code, size = 20) => {
        const normalized = __pjNormalizeCountryCode(code);
        if (normalized.length !== 2) return '';
        const width = __pjPickFlagWidth(size);
        return `https://flagcdn.com/w${width}/${normalized.toLowerCase()}.png`;
    };
    const __pjCountryFlagBackupUrl = (code, size = 24) => {
        const normalized = __pjNormalizeCountryCode(code);
        if (normalized.length !== 2) return '';
        const px = __pjPickFlagWidth(size);
        return `https://flagsapi.com/${normalized}/flat/${px}.png`;
    };
    const __pjBuildCountryDisplayHtml = (country, options = {}) => {
        const showName = options.showName !== false;
        const imgSize = Number(options.imgSize || 18);
        const gap = Number(options.gap || 6);
        const fallbackSize = Number(options.fallbackSize || 14);

        const name = __pjResolveCountryName(country?.name || '', country?.code || '');
        const code = __pjResolveCountryCode(country?.code || '', name || country?.name || '');
        const renderSize = __pjPickFlagWidth(Math.max(imgSize * 2, 20));
        const flagUrl = __pjCountryFlagImageUrl(code, renderSize);
        const backupUrl = __pjCountryFlagBackupUrl(code, renderSize);
        const fallback = __pjCountryCodeToFlagEmoji(code) || '🏳️';

        const flagPart = flagUrl
            ? `<span style="display:inline-flex;align-items:center;">
                <img src="${pjEsc(flagUrl)}" alt="Bandeira ${pjEsc(name || code || '')}" style="width:${imgSize}px;height:${Math.round(imgSize * 0.72)}px;object-fit:cover;border:1px solid #e5e7eb;border-radius:2px;vertical-align:middle;" loading="lazy" decoding="async" onerror="if(!this.dataset.fallback&&'${pjEsc(backupUrl)}'){this.dataset.fallback='1';this.src='${pjEsc(backupUrl)}';return;}this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-flex';">
                <span style="display:none;font-size:${fallbackSize}px;line-height:1;">${pjEsc(fallback)}</span>
            </span>`
            : `<span style="font-size:${fallbackSize}px;line-height:1;">${pjEsc(fallback)}</span>`;

        if (!showName) return flagPart;
        return `<span style="display:inline-flex;align-items:center;gap:${gap}px;">${flagPart}<span>${pjEsc(name || '—')}</span></span>`;
    };
    const __pjGetProductCountriesMeta = (product) => {
        const list = [];
        if (Array.isArray(product?.countries) && product.countries.length) {
            product.countries.forEach((item, index) => {
                if (item && typeof item === 'object') {
                    const name = __pjResolveCountryName(item.name || item.country || '', item.code || item.countryCode || '');
                    const code = __pjResolveCountryCode(item.code || item.countryCode || '', name);
                    if (name) list.push({ name, code });
                    return;
                }
                const rawName = __pjNormalizeCountryName(item);
                const code = __pjResolveCountryCode(Array.isArray(product.countryCodes) ? product.countryCodes[index] : '', rawName);
                const name = __pjResolveCountryName(rawName, code);
                if (name) list.push({ name, code });
            });
        }

        if (!list.length) {
            const rawName = __pjNormalizeCountryName(product?.country || product?.zone || '');
            const rawCode = __pjNormalizeCountryCode(product?.countryCode || '');
            const name = __pjResolveCountryName(rawName, rawCode);
            const code = __pjResolveCountryCode(rawCode, name || rawName);
            if (name) list.push({ name, code });
        }

        const dedup = new Map();
        list.forEach(item => {
            const key = __pjNormalizeCountryName(item.name).toLowerCase();
            if (!key) return;
            if (!dedup.has(key)) {
                dedup.set(key, { name: item.name, code: item.code });
                return;
            }
            const existing = dedup.get(key);
            if (!existing.code && item.code) existing.code = item.code;
        });

        return [...dedup.values()];
    };
    const __pjGetPrimaryCountryMeta = (product) => __pjGetProductCountriesMeta(product)[0] || null;

    // Toast simples (mensagem flutuante) para feedback de ações
    let __pjToastTimer = null;
    const __pjToast = (message) => {
        try {
            if (!message) return;
            let host = document.getElementById('pj-toast-host');
            if (!host) {
                host = document.createElement('div');
                host.id = 'pj-toast-host';
                host.setAttribute(
                    'style',
                    [
                        'position:fixed',
                        'inset:0',
                        'z-index:2147483647',
                        'pointer-events:none'
                    ].join(';')
                );
                (document.documentElement || document.body).appendChild(host);
            }

            // Ensure it stays last in DOM so it paints above other same-root siblings
            const root = document.documentElement || document.body;
            if (host.parentNode !== root) {
                try { root.appendChild(host); } catch (_) {}
            } else if (host !== root.lastElementChild) {
                try { root.appendChild(host); } catch (_) {}
            }

            let el = document.getElementById('pj-toast');
            if (!el) {
                el = document.createElement('div');
                el.id = 'pj-toast';
                el.setAttribute(
                    'style',
                    [
                        'position:fixed',
                        'right:18px',
                        'top:18px',
                        'left:auto',
                        'bottom:auto',
                        'transform:translateY(-6px)',
                        'background:rgba(17,24,39,.95)',
                        'color:#fff',
                        'padding:10px 14px',
                        'border-radius:999px',
                        'font-weight:700',
                        'font-size:14px',
                        'z-index:2147483647',
                        'box-shadow:0 10px 25px rgba(0,0,0,.25)',
                        'opacity:0',
                        'transition:opacity .18s ease, transform .18s ease',
                        'max-width:min(520px, calc(100vw - 36px))',
                        'white-space:nowrap',
                        'overflow:hidden',
                        'text-overflow:ellipsis'
                    ].join(';')
                );
                host.appendChild(el);
            }

            el.textContent = message;
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';

            if (__pjToastTimer) window.clearTimeout(__pjToastTimer);
            __pjToastTimer = window.setTimeout(() => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(-6px)';
            }, 1400);
        } catch (_) {}
    };

    window.__pjToggleFavorite = (productId) => {
        const id = String(productId);
        const ids = __pjGetFavoriteIds();
        const exists = ids.includes(id);
        const next = exists ? ids.filter(x => x !== id) : [id, ...ids];
        __pjSetFavoriteIds(next);
        const btn = document.getElementById('pj-modal-fav-btn');
        if (btn) btn.classList.toggle('active', !exists);

        __pjToast(exists ? 'Removido dos favoritos' : 'Adicionado aos favoritos');

        // também tenta atualizar a lista de favoritos do app (se existir)
        if (typeof renderFavorites === 'function') renderFavorites();
    };

    window.__pjAddToCart = (productId) => {
        const id = String(productId);
        const cart = __pjGetShoppingCart();
        const existing = cart.find(it => String(it.productId) === id);
        if (existing) existing.quantity = (existing.quantity || 1) + 1;
        else cart.push({ productId: id, quantity: 1, addedAt: Date.now() });
        __pjSetShoppingCart(cart);

        // Mantém o carrinho do app (sessionStorage('cart')) sincronizado com objetos de produto + quantity
        let mapped = [];
        try {
            const products = getFromLocalStorage('products');
            mapped = cart
                .map(it => {
                    const p = products.find(x => String(x.id) === String(it.productId));
                    if (!p) return null;
                    const copy = Object.assign({}, p);
                    copy.quantity = it.quantity || 1;
                    return copy;
                })
                .filter(Boolean);
            sessionStorage.setItem('cart', JSON.stringify(mapped));
        } catch (_) {}

        // Feedback visual (igual ao Favorito)
        const btn = document.getElementById('pj-modal-cart-btn');
        if (btn) {
            btn.classList.add('active');
            const prevBg = btn.style.background;
            const prevBorder = btn.style.borderColor;
            btn.style.background = '#dcfce7';
            btn.style.borderColor = '#22c55e';
            window.setTimeout(() => {
                btn.classList.remove('active');
                btn.style.background = prevBg;
                btn.style.borderColor = prevBorder;
            }, 650);
        }

        __pjToast('Adicionado ao carrinho');

        if (typeof updateCartBadge === 'function') updateCartBadge();
        if (typeof renderCartItems === 'function') renderCartItems();

        // NÃO abre o modal do carrinho automaticamente (só adiciona + badge + feedback)
    };

    window.__pjOpenSuggest = (productId) => {
        const products = getFromLocalStorage('products');
        const p = products.find(x => String(x.id) === String(productId));
        if (!p) return;

        // Se o modal do index existir, usa ele (UX melhor).
        const modal = document.getElementById('suggestion-modal');
        if (modal) {
            // garante que o modal de sugestão fique na frente do modal do produto
            try { modal.style.zIndex = '300000'; } catch (_) {}
            const idInput = document.getElementById('modal-suggestion-product-id');
            const nameInput = document.getElementById('modal-suggestion-product-name');
            const marketInput = document.getElementById('modal-suggestion-market');
            if (idInput) idInput.value = p.id;
            if (nameInput) nameInput.value = p.name;
            if (marketInput) marketInput.value = p.market || '';

            // abre depois de um tick pra evitar disputa de z-index/paint com o modal de produto
            window.setTimeout(() => {
                if (typeof openModal === 'function') openModal(modal);
                else {
                    modal.style.display = 'flex';
                    modal.classList.add('show');
                }
            }, 0);
            return;
        }

        // Fallback (sem modal): salva sugestão no localStorage no mesmo formato do produto.html
        const price = prompt(`💰 Sugerir preço para "${p.name}":\n\nDigite o preço em euros (ex: 2.50):`);
        if (price && !isNaN(parseFloat(price))) {
            __pjUpsertPriceSuggestion({
                productId: String(p.id),
                productName: p.name,
                price: parseFloat(price),
                suggestedAt: Date.now(),
                status: 'pending'
            });
        }
    };

    if (modalSuggestionForm) {
        modalSuggestionForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const productId = (modalSuggestionProductId?.value || '').toString().trim();
            const productName = (modalSuggestionProductName?.value || '').toString().trim();
            const market = (modalSuggestionMarket?.value || '').toString().trim();
            const rawPrice = (modalSuggestionNewPrice?.value || '').toString().trim().replace(',', '.');
            const parsed = Number(rawPrice);

            if (!rawPrice || Number.isNaN(parsed) || parsed <= 0) {
                alert('Por favor, insira um preço válido.');
                return;
            }

            __pjUpsertPriceSuggestion({
                id: Date.now(),
                productId,
                productName,
                market,
                suggestedPrice: parsed,
                date: new Date().toISOString(),
                status: 'pending'
            });

            alert('Sua sugestão foi enviada com sucesso e será analisada pela administração!');
            closeModal(suggestionModal);
            modalSuggestionForm.reset();
        });
    }

    const renderModernProductModal = (p) => {
        if (!pjProductModalBody) return;
    const isFav = __pjGetFavoriteIds().includes(String(p.id));

    const barcodeValue = (p.barcode || p.codigoBarras || p.barCode || '').toString().trim();
    const hasBarcode = !!barcodeValue;

    // Unidade: tenta compor "quantidade + unidade" se existir
    const qty = (p.quantity ?? p.quantidade ?? '').toString().trim();
    const unit = (p.unit ?? p.unidade ?? '').toString().trim();
    let unitLabel = '';
    if (qty && unit) unitLabel = `${qty}${unit}`; // ex: 1kg, 500ml
    else if (unit) unitLabel = unit;
    else if (qty) unitLabel = qty;

    const marketName = (p.market || p.mercado || '').toString().trim();
    const marketLogo = __pjFindMarketLogo(marketName);

    const modalCountriesMeta = __pjGetProductCountriesMeta(p);
    const countryHtml = modalCountriesMeta
        .map(item => __pjBuildCountryDisplayHtml(item, { showName: true, imgSize: 18, gap: 6, fallbackSize: 14 }))
        .filter(Boolean)
        .join('<span style="opacity:.55;padding:0 4px;">•</span>');

    const isDesktopModal = window.matchMedia && window.matchMedia('(min-width: 1024px)').matches;
    const modalImageSize = isDesktopModal ? 124 : 160;
    const modalTitleFontSize = isDesktopModal ? 22 : 26;
    const modalPriceFontSize = isDesktopModal ? 26 : 30;
    const modalActionPadding = isDesktopModal ? '8px 12px' : '10px 14px';
    const modalCardMinWidth = isDesktopModal ? 190 : 220;
    const modalBodyPadding = isDesktopModal ? '12px 12px 6px 12px' : '16px 16px 8px 16px';
    const modalMainGap = isDesktopModal ? 10 : 16;
    const modalHeaderGap = isDesktopModal ? 10 : 16;
    const modalInfoGap = isDesktopModal ? 8 : 10;

        pjProductModalBody.innerHTML = `
            <div style="background:#fff;border-radius:12px;overflow:hidden;">
                <div style="padding:${modalBodyPadding};display:flex;flex-direction:column;gap:${modalMainGap}px;max-height:calc(88vh - 120px);overflow:auto;">
                    <div style="display:flex;gap:${modalHeaderGap}px;align-items:flex-start;flex-wrap:wrap;">
                        <div style="flex:0 0 auto;">
                            <img
                                src="${__PJ_PLACEHOLDER_IMG}"
                                data-src="${pjEsc(p.imageUrl || DEFAULT_IMAGE_URL)}"
                                alt="${pjEsc(p.name)}"
                                style="width:${modalImageSize}px;height:${modalImageSize}px;object-fit:cover;border-radius:10px;border:1px solid #e5e7eb;background:#f9fafb;"
                                loading="lazy" decoding="async" />
                        </div>
                        <div style="flex:1;min-width:${isDesktopModal ? 220 : 240}px;">
                            <div style="font-size:${modalTitleFontSize}px;font-weight:800;color:#111827;line-height:1.12;word-break:break-word;">${pjEsc(p.name)}</div>
                            <div style="margin-top:${isDesktopModal ? 6 : 8}px;font-size:${modalPriceFontSize}px;font-weight:900;color:#4f46e5;line-height:1.05;">€${Number(p.price || 0).toFixed(2).replace('.', ',')}</div>
                            <div style="margin-top:${isDesktopModal ? 10 : 12}px;display:flex;flex-wrap:wrap;gap:${isDesktopModal ? 8 : 10}px;">
                                <button id="pj-modal-fav-btn" class="favorite-btn${isFav ? ' active' : ''}" onclick="window.__pjToggleFavorite('${pjEsc(p.id)}')" style="padding:${modalActionPadding};border-radius:10px;border:1px solid #fecaca;background:#fff;display:flex;align-items:center;gap:8px;cursor:pointer;">
                                    <i class="fas fa-heart"></i>
                                    <span>Favorito</span>
                                </button>
                                <button id="pj-modal-cart-btn" onclick="window.__pjAddToCart('${pjEsc(p.id)}')" style="padding:${modalActionPadding};border-radius:10px;border:1px solid #bbf7d0;background:#fff;display:flex;align-items:center;gap:8px;cursor:pointer;transition:transform .08s ease, background .2s ease, border-color .2s ease;" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform=''" onmouseleave="this.style.transform=''">
                                    <i class="fas fa-shopping-cart"></i>
                                    <span>Carrinho</span>
                                </button>
                                <button onclick="window.__pjOpenSuggest('${pjEsc(p.id)}')" style="padding:${modalActionPadding};border-radius:10px;border:1px solid #fde68a;background:#fff;display:flex;align-items:center;gap:8px;cursor:pointer;">
                                    <i class="fas fa-tag"></i>
                                    <span>Sugerir Preço</span>
                                </button>
                                <button id="pj-modal-compare-btn" style="padding:${isDesktopModal ? '8px 14px' : '10px 16px'};border-radius:10px;border:none;background:#2563eb;color:#fff;display:flex;align-items:center;gap:8px;cursor:pointer;">
                                    <i class="fas fa-balance-scale"></i>
                                    <span>Comparar</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(${modalCardMinWidth}px,1fr));gap:${modalInfoGap}px;margin-top:${isDesktopModal ? 4 : 8}px;">
                        ${hasBarcode ? `
                        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:10px 12px;">
                            <div style="font-size:12px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:.04em;">
                                <i class="fas fa-barcode"></i> Código de Barras
                            </div>
                            <div style="margin-top:4px;font-family:monospace;font-size:13px;color:#1e3a8a;word-break:break-all;">${pjEsc(barcodeValue)}</div>
                        </div>` : ''}

                        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;display:flex;gap:12px;align-items:center;">
                            <div style="flex:0 0 auto;width:48px;height:48px;border-radius:10px;border:1px solid #e5e7eb;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center;">
                                <img src="${pjEsc(marketLogo || 'images/icons/icon-192.png')}" alt="Logo" style="width:100%;height:100%;object-fit:contain;" loading="lazy" decoding="async">
                            </div>
                            <div style="flex:1;min-width:0;">
                                <div style="font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.04em;">
                                    <i class="fas fa-store"></i> Mercado
                                </div>
                                <div style="margin-top:2px;font-size:14px;color:#111827;">${pjEsc(marketName || '—')}</div>
                            </div>
                        </div>

                        ${p.brand ? `
                        <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:10px;padding:10px 12px;">
                            <div style="font-size:12px;font-weight:700;color:#6b21a8;text-transform:uppercase;letter-spacing:.04em;">
                                <i class="fas fa-tag"></i> Marca
                            </div>
                            <div style="margin-top:4px;font-size:14px;color:#3b0764;">${pjEsc(p.brand)}</div>
                        </div>` : ''}

                        ${p.category ? `
                        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 12px;">
                            <div style="font-size:12px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:.04em;">
                                <i class="fas fa-list"></i> Categoria
                            </div>
                            <div style="margin-top:4px;font-size:14px;color:#14532d;">${pjEsc(p.category)}</div>
                        </div>` : ''}

                        ${unitLabel ? `
                        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:10px 12px;">
                            <div style="font-size:12px;font-weight:700;color:#9a3412;text-transform:uppercase;letter-spacing:.04em;">
                                <i class="fas fa-weight"></i> Unidade
                            </div>
                            <div style="margin-top:4px;font-size:14px;color:#7c2d12;font-weight:700;">${pjEsc(unitLabel)}</div>
                        </div>` : ''}

                        ${countryHtml ? `
                        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:10px 12px;">
                            <div style="font-size:12px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:.04em;">
                                <i class="fas fa-globe"></i> País
                            </div>
                            <div style="margin-top:4px;font-size:14px;color:#7f1d1d;font-weight:700;">${countryHtml}</div>
                        </div>` : ''}
                    </div>

                    ${p.description ? `
                    <div style="margin-top:6px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
                        <div style="font-size:12px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;">Descrição</div>
                        <div style="color:#374151;line-height:${isDesktopModal ? '1.42' : '1.55'};font-size:${isDesktopModal ? '13px' : '14px'};">${pjEsc(p.description)}</div>
                    </div>` : ''}
                </div>
            </div>
        `;

        // lazy-load da imagem dentro do modal
        __pjSetupLazyImages(pjProductModalBody);

        // bind actions (evita problemas de escopo de onclick inline)
        try {
            const compareBtn = document.getElementById('pj-modal-compare-btn');
            if (compareBtn) {
                compareBtn.onclick = () => {
                    try {
                        const fn = (typeof openCompareModal === 'function') ? openCompareModal : window.openCompareModal;
                        pjCloseModal();
                        if (typeof fn === 'function') {
                            fn(p.name, { returnType: 'product-modal', returnProductId: p.id });
                        }
                    } catch (_) {}
                };
            }
        } catch (_) {}
    };

    const openProductDetail = (productId) => {
        if (!productId && productId !== 0) return;
        const products = getFromLocalStorage('products');
        const p = products.find(x => String(x.id) === String(productId));
        if (!p) {
            // fallback: se não achar, navega (evita tela vazia)
            window.location.href = `produto.html?id=${encodeURIComponent(String(productId))}`;
            return;
        }
        renderModernProductModal(p);
        try {
            if (pjProductModal) {
                pjProductModal.dataset.productId = String(p.id || '');
            }
        } catch (_) { /* noop */ }
        pjOpenModal();
    };
    window.openProductDetail = openProductDetail;

    // Criação do item de lista para os modais (carrinho e favoritos)
    const createModalListItem = (product, isCartItem = false) => {
        const listItem = document.createElement('div');
        listItem.classList.add('modal-list-item');
        
        const removeButton = isCartItem ? `<button class="remove-from-cart-btn" data-id="${product.id}"><i class="fas fa-trash-alt"></i></button>` : `<button class="remove-from-favorites-btn" data-id="${product.id}"><i class="fas fa-trash-alt"></i></button>`;
        
        const quantityControl = isCartItem ? `
            <div class="quantity-control">
                <button class="quantity-minus-btn" data-id="${product.id}">-</button>
                <span class="quantity-display">${product.quantity}</span>
                <button class="quantity-plus-btn" data-id="${product.id}">+</button>
            </div>
        ` : '';

        listItem.innerHTML = `
            <img src="${product.imageUrl || DEFAULT_IMAGE_URL}" alt="${product.name}" class="modal-item-image" loading="lazy" decoding="async">
            <div class="modal-item-info">
                <h4 class="modal-item-name">${product.name}</h4>
                <p class="modal-item-price">${formatPrice(product.price)}</p>
            </div>
            ${quantityControl}
            <div class="modal-item-actions">
                ${removeButton}
            </div>
        `;

        return listItem;
    };

    const createFavoriteListItem = (product) => {
        const item = document.createElement('div');
        item.className = 'favorite-list-item';
        item.innerHTML = `
            <img src="${product.imageUrl || DEFAULT_IMAGE_URL}" alt="${product.name}" class="favorite-item-image" loading="lazy" decoding="async">
            <div class="favorite-item-info">
                <h4 class="favorite-item-name">${product.name}</h4>
                <p class="favorite-item-market"><i class="fas fa-store"></i> ${product.market || 'Sem mercado'}</p>
                <p class="favorite-item-price">${formatPrice(product.price)}</p>
            </div>
            <div class="favorite-item-actions">
                <button class="add-to-cart-btn" data-id="${product.id}" title="Adicionar ao Carrinho"><i class="fas fa-shopping-cart"></i></button>
                <button class="remove-from-favorites-btn" data-id="${product.id}" title="Remover dos Favoritos"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        return item;
    };

    const __marketColorCache = {};
    const getMarketAccentColor = (marketName) => {
        const key = (marketName || 'Outros').toString().trim().toLowerCase();
        if (__marketColorCache[key]) return __marketColorCache[key];
        let hash = 0;
        for (let i = 0; i < key.length; i += 1) {
            hash = key.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        const color = `hsl(${hue}, 70%, 45%)`;
        __marketColorCache[key] = color;
        return color;
    };

    const updateCartMarketFilterOptions = (groups, selectedValue = 'all') => {
        if (!cartMarketFilter) return;
        const markets = Object.keys(groups || {}).sort((a, b) => a.localeCompare(b, 'pt-PT'));
        cartMarketFilter.innerHTML = `<option value="all">Todos os mercados</option>${markets.map(m => `<option value="${m}">${m}</option>`).join('')}`;
        cartMarketFilter.value = markets.includes(selectedValue) ? selectedValue : 'all';
    };

    const renderCartMarketBreakdown = (marketTotals, grandTotal) => {
        if (!cartMarketBreakdown) return;
        const entries = Object.entries(marketTotals || {}).sort((a, b) => a[0].localeCompare(b[0], 'pt-PT'));
        if (!entries.length) {
            cartMarketBreakdown.innerHTML = '';
            return;
        }
        cartMarketBreakdown.innerHTML = entries.map(([market, total]) => {
            const accent = getMarketAccentColor(market);
            return `
                <div class="market-breakdown-row" style="--market-accent:${accent};">
                    <span class="market-breakdown-name">${market}</span>
                    <strong class="market-breakdown-total">${formatPrice(total)}</strong>
                </div>
            `;
        }).join('') + `
            <div class="market-breakdown-row total" style="--market-accent:#111827;">
                <span class="market-breakdown-name">Total Geral</span>
                <strong class="market-breakdown-total">${formatPrice(grandTotal)}</strong>
            </div>
        `;
    };


    // Renderização dos Produtos na tela principal
    const renderProducts = (productsToRender = getFromLocalStorage('products')) => {
        productsList.innerHTML = '';
        if (productsToRender.length === 0) {
            document.getElementById('no-products-message').style.display = 'block';
            productsList.innerHTML = '';
        } else {
            document.getElementById('no-products-message').style.display = 'none';
            const favorites = getFromSessionStorage('favorites');
            productsToRender.forEach(product => {
                const isFavorite = favorites.some(fav => fav.id === product.id);
                const productCard = createProductCard(product, isFavorite);
                // add dataset name for opening compare modal
                productCard.dataset.productName = (product.name || '').toLowerCase().trim();
                productsList.appendChild(productCard);
            });
        }

        // garante lazy-load para qualquer imagem pendente
        __pjSetupLazyImages(productsList);

        // Garante que o estado dos botões é verificado após a renderização
        setTimeout(manageScrollButtons, 100);

        // Atualiza a página de "todos os produtos" se estiver aberta
        if (allProductsPage && allProductsPage.style.display !== 'none') {
            renderAllProductsPage();
        }
    };
    
    // Tornar renderProducts disponível globalmente para firebase-loader.js
    window.renderProducts = renderProducts;

    // Compare modal helpers
    const compareModal = document.getElementById('compare-modal');
    const compareList = document.getElementById('compare-list');
    const compareEmpty = document.getElementById('compare-empty');
    const compareTitle = document.getElementById('compare-modal-title');
    const closeCompareBtn = document.getElementById('close-compare-btn');

    const setCompareReturnContext = ({ type = 'page', productId = '' } = {}) => {
        if (!compareModal) return;
        compareModal.dataset.comparePrevType = String(type || 'page');
        compareModal.dataset.comparePrevProductId = String(productId || '');
    };

    const setCompareTopBackMode = (mode = 'list') => {
        if (!closeCompareBtn) return;
        closeCompareBtn.classList.add('compare-back-btn');
        closeCompareBtn.textContent = '←';
        closeCompareBtn.setAttribute('aria-label', 'Voltar');
        closeCompareBtn.setAttribute('title', 'Voltar');
        if (compareModal) compareModal.dataset.compareView = mode;
    };

    const isCompareModalVisible = () => {
        if (!compareModal) return false;
        return compareModal.classList.contains('show') || compareModal.style.display === 'flex';
    };

    const ensureCompareModalOpen = () => {
        if (!compareModal) return;
        if (isCompareModalVisible()) return;
        openModal(compareModal);
    };

    const normalizeName = (name) => name ? name.toString().toLowerCase().replace(/\s+/g, ' ').trim() : '';
    const normalizeCompareText = (value) => (value || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Attempt to extract a 'core' product name by removing brand tokens and common qualifiers
    const extractCoreName = (name, brand) => {
        if (!name) return '';
        let n = name.toString();
        // remove brand occurrences if present in the name
        if (brand) {
            try {
                const b = brand.toString().trim();
                if (b.length > 0) {
                    // remove exact brand as whole word (case-insensitive)
                    const re = new RegExp('\\b' + b.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&') + '\\b', 'i');
                    n = n.replace(re, '');
                }
            } catch (err) { /* ignore regex errors */ }
        }
        // remove common separators and extra qualifiers like 'marca', 'pack', weight units etc.
        n = n.replace(/[-–—_|\/]/g, ' ');
        n = n.replace(/marca\s+\w+/ig, '');
        n = n.replace(/\b(kg|g|ml|l|un|unidade|pacote|pack|saco|frasco)\b/ig, '');
        // remove extra punctuation and numbers that typically denote SKU or pack-size
        n = n.replace(/[\d]+(g|kg|ml|l)?/ig, '');
        // trim, normalize spaces and drop trailing brand-like tokens
        n = n.replace(/\s+/g, ' ').trim();
        return normalizeName(n);
    };

    const __pjCompareStopwords = new Set([
        'de', 'do', 'da', 'dos', 'das', 'e', 'com', 'sem', 'para', 'por', 'em',
        'tipo', 'extra', 'virgem', 'integral', 'refinado', 'classico', 'classic',
        'premium', 'super', 'light', 'bio', 'pack', 'pacote', 'un', 'unidade',
        'kg', 'g', 'gr', 'l', 'ml'
    ]);

    const getComparableNameTokens = (name, brand = '', market = '') => {
        const core = extractCoreName(name, brand);
        let text = normalizeCompareText(core || name || '');
        const marketText = normalizeCompareText(market || '');

        if (marketText) {
            marketText.split(' ').forEach(token => {
                if (!token) return;
                const marketRe = new RegExp('\\b' + token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
                text = text.replace(marketRe, ' ');
            });
            text = text.replace(/\s+/g, ' ').trim();
        }

        return text
            .split(' ')
            .map(t => t.trim())
            .filter(t => t.length > 1 && !__pjCompareStopwords.has(t));
    };

    const isGenericNameMatch = (candidateName, requestedName, candidateBrand = '', candidateMarket = '') => {
        const requestedTokens = getComparableNameTokens(requestedName, '', '');
        const candidateTokens = getComparableNameTokens(candidateName, candidateBrand, candidateMarket);

        if (!requestedTokens.length || !candidateTokens.length) return false;

        const sameFirst = candidateTokens[0] === requestedTokens[0];
        if (!sameFirst) return false;

        const sameFirstTwo = requestedTokens.length > 1 && candidateTokens.length > 1
            && candidateTokens[1] === requestedTokens[1];
        if (sameFirstTwo) return true;

        const requestedSet = new Set(requestedTokens);
        const candidateSet = new Set(candidateTokens);
        const intersection = [...requestedSet].filter(x => candidateSet.has(x)).length;
        const overlap = intersection / Math.max(requestedSet.size, 1);
        return overlap >= 0.4;
    };

    const openCompareModal = (productName, options = {}) => {
        const products = getFromLocalStorage('products');
        const normalized = normalizeName(productName);
        const isGenericArrozSearch = normalized === 'arroz';
        const compareModalContent = compareModal ? compareModal.querySelector('.modal-content') : null;

        setCompareTopBackMode('list');

        if (!options.preserveReturnContext) {
            if (options.returnType) {
                setCompareReturnContext({ type: options.returnType, productId: options.returnProductId || '' });
            } else {
                setCompareReturnContext({ type: 'page', productId: '' });
            }
        }

        // build core name for the requested product (if brand passed within name, try to strip later)
        // try to detect brand by checking last token (common pattern: '... <brand>')
        const tokens = productName ? productName.split(/\s+/) : [];
        let guessedBrand = '';
        if (tokens.length > 1) {
            guessedBrand = tokens[tokens.length - 1];
        }
        const requestedCore = extractCoreName(productName, guessedBrand);

        // first try to find products whose core name equals requested core
        let matches = products.filter(p => extractCoreName(p.name, p.brand) === requestedCore && requestedCore.length > 0);

        // expand by generic leading name (ex: "azeite continente" vs "azeite pingo doce")
        const genericMatches = products.filter(p => !matches.includes(p) && isGenericNameMatch(p.name, productName, p.brand, p.market));
        if (genericMatches.length) matches.push(...genericMatches);

        // fallback: if no matches by core, try exact name or substring match
        if (matches.length === 0) {
            const normalizedQuery = normalizeCompareText(productName);
            matches = products.filter(p => normalizeCompareText(p.name) === normalizedQuery);
            if (matches.length === 0) {
                matches = products.filter(p => {
                    const n = normalizeCompareText(p.name);
                    return n.includes(normalizedQuery) || isGenericNameMatch(p.name, productName, p.brand, p.market);
                });
            }
        }

        // Special-case filtering: if user searched just 'arroz', exclude specific rice types
        if (isGenericArrozSearch) {
            const excludeTerms = ['parboilizado', 'parbo', 'branco', 'integral', 'agulha'];
            matches = matches.filter(p => {
                const n = normalizeName((p.name || '') + ' ' + (p.category || '') + ' ' + (p.brand || ''));
                return !excludeTerms.some(term => n.includes(term));
            });
        }

        compareList.innerHTML = '';
        try {
            compareList.scrollTop = 0;
            if (compareModalContent) compareModalContent.scrollTop = 0;
        } catch (_) { /* noop */ }
        if (!matches || matches.length === 0) {
            compareEmpty.style.display = 'block';
            compareTitle.textContent = `Comparar: ${productName}`;
            ensureCompareModalOpen();
            return;
        }
        compareEmpty.style.display = 'none';
        // group matches into branded vs private-label (marca branca)
        const isPrivateLabel = (brand) => {
            if (!brand) return true;
            const b = brand.toString().toLowerCase();
            // common indicators of store brands / private labels
            const indicators = ['marca branca', 'marca própria', 'propria', 'marca do mercado', 'marca própria', 'marca própria', 'marca de distribuidor'];
            if (indicators.some(ind => b.includes(ind))) return true;
            // if brand is very short (like 1-2 letters) or generic, treat as private label
            if (b.length <= 2) return true;
            return false;
        };

    const branded = [];
    const privateLabel = [];
    const favoritesList = getFromSessionStorage('favorites');
    const cartList = getFromSessionStorage('cart');
    const isFav = (id) => favoritesList.some(f => String(f.id) === String(id));
    const inCart = (id) => cartList.some(c => String(c.id) === String(id));
    const getMarketLogoHtml = (marketName, extraClass = '') => {
        const logo = __pjFindMarketLogo(marketName);
        const classes = ['compare-market-logo'];
        if (extraClass) classes.push(extraClass);
        const className = classes.join(' ');
        const fallback = 'images/icons/icon-192.png';
        if (logo) {
            return `<img src="${pjEsc(logo)}" alt="Logo ${pjEsc(marketName || '')}" class="${className}" loading="lazy" decoding="async" onerror="if(this.dataset.fallback)return;this.dataset.fallback='1';this.src='${fallback}';">`;
        }
        return `<img src="${fallback}" alt="Logo" class="${className}" loading="lazy" decoding="async">`;
    };
    const getCountryHtml = (item, showName = true) => {
        const primary = __pjGetPrimaryCountryMeta(item);
        if (!primary) return showName ? '<span style="opacity:.7;">—</span>' : '';
        return __pjBuildCountryDisplayHtml(primary, { showName, imgSize: 16, gap: 6, fallbackSize: 13 });
    };
        matches.forEach(p => { if (isPrivateLabel(p.brand)) privateLabel.push(p); else branded.push(p); });

        // find cheapest per group and globally
    const cheapestGlobal = matches.length ? matches.reduce((min, it) => parseFloat(it.price) < parseFloat(min.price) ? it : min, matches[0]) : null;
        const cheapestBranded = branded.length ? branded.reduce((min, it) => parseFloat(it.price) < parseFloat(min.price) ? it : min, branded[0]) : null;
        const cheapestPrivate = privateLabel.length ? privateLabel.reduce((min, it) => parseFloat(it.price) < parseFloat(min.price) ? it : min, privateLabel[0]) : null;

        compareTitle.textContent = `Comparar: ${productName}`;
        if (compareModal) compareModal.dataset.compareProduct = productName;

    // Ordena por preço ascendente (mantém referência do mais barato já calculado)
    matches.sort((a,b) => parseFloat(a.price) - parseFloat(b.price));
    const others = matches.filter(p => p !== cheapestGlobal);

    // Modo desktop redesenhado: produto mais barato em destaque no topo + lista compacta
        const desktopLayout = document.createElement('div');
        desktopLayout.className = 'compare-desktop-redesign';

        // Card destaque
        const highlightCard = document.createElement('div');
        highlightCard.className = 'compare-highlight-card';
    highlightCard.dataset.productId = cheapestGlobal.id;
        highlightCard.innerHTML = `
            <div class="highlight-left">
                <img src="${cheapestGlobal.imageUrl || DEFAULT_IMAGE_URL}" alt="${cheapestGlobal.name}" class="highlight-image" loading="lazy">
            </div>
            <div class="highlight-main">
                <h3 class="highlight-name">${cheapestGlobal.name}</h3>
                <div class="highlight-meta">
                    <span class="highlight-market">${getMarketLogoHtml(cheapestGlobal.market || '', 'compare-market-logo--xl')}</span>
                    <span class="highlight-country">${getCountryHtml(cheapestGlobal, true)}</span>
                    <span class="highlight-brand">${cheapestGlobal.brand || ''}</span>
                    ${cheapestGlobal.barcode ? `<span class="highlight-barcode">EAN: ${cheapestGlobal.barcode}</span>` : ''}
                </div>
                <div class="highlight-price-row">
                    <span class="highlight-price">${formatPrice(cheapestGlobal.price)}</span>
                    <span class="highlight-badge">Mais Barato</span>
                </div>
                <div class="highlight-actions">
                    <button class="fav-btn ${isFav(cheapestGlobal.id) ? 'fav-active' : ''}" aria-pressed="${isFav(cheapestGlobal.id)}" data-id="${cheapestGlobal.id}" title="Favoritar"><i class="fas fa-heart"></i></button>
                    <button class="cart-btn ${inCart(cheapestGlobal.id) ? 'adicionado in-cart' : ''}" aria-pressed="${inCart(cheapestGlobal.id)}" data-id="${cheapestGlobal.id}" title="Adicionar ao carrinho"><i class="fas fa-shopping-cart"></i></button>
                </div>
            </div>
        `;
        desktopLayout.appendChild(highlightCard);

        // Lista dos outros produtos
        const listWrapper = document.createElement('div');
        listWrapper.className = 'compare-list-wrapper';
        const ul = document.createElement('div');
        ul.className = 'compare-linear-list';

        // Função para calcular diferença percentual em relação ao mais barato
        const diffPercent = (price) => {
            const base = parseFloat(cheapestGlobal.price);
            const current = parseFloat(price);
            if (!isFinite(base) || base <= 0) return '—';
            const pct = ((current - base) / base) * 100;
            return pct === 0 ? 'Igual' : `+${pct.toFixed(1)}%`;
        };

        others.forEach(p => {
            const item = document.createElement('div');
            item.className = 'compare-linear-item';
            item.dataset.productId = p.id;
            item.innerHTML = `
                <div class="cli-image-col">
                    <img src="${p.imageUrl || DEFAULT_IMAGE_URL}" alt="${p.name}" class="cli-image" loading="lazy">
                </div>
                <div class="cli-name-col" title="${p.name}">${p.name}</div>
                <div class="cli-market-col"></div>
                <div class="cli-country-col">
                    <div class="cli-country-market-stack">
                        <span class="cli-country-flag">${getCountryHtml(p, false)}</span>
                        <span class="cli-market-under-flag">${getMarketLogoHtml(p.market || '', 'compare-market-logo--sm')}</span>
                    </div>
                </div>
                <div class="cli-price-col">${formatPrice(p.price)}</div>
                <div class="cli-diff-col">${diffPercent(p.price)}</div>
                <div class="cli-actions-col">
                    <button class="fav-btn ${isFav(p.id) ? 'fav-active' : ''}" aria-pressed="${isFav(p.id)}" data-id="${p.id}" title="Favoritar"><i class="fas fa-heart"></i></button>
                    <button class="cart-btn ${inCart(p.id) ? 'adicionado in-cart' : ''}" aria-pressed="${inCart(p.id)}" data-id="${p.id}" title="Adicionar ao carrinho"><i class="fas fa-shopping-cart"></i></button>
                </div>
            `;
            ul.appendChild(item);
        });
        listWrapper.appendChild(ul);
        desktopLayout.appendChild(listWrapper);

        // clicar no card abre a seção de informação do produto no próprio modal
        compareList.onclick = function (e) {
            // cliques nos botões de ação seguem o handler dedicado
            if (e.target.closest('.fav-btn') || e.target.closest('.cart-btn')) return;
            const itemNode = e.target.closest('.compare-linear-item, .compare-highlight-card, .compare-card, .compare-item');
            if (!itemNode) return;
            const id = itemNode.dataset.productId;
            if (!id) return;
            showCompareItemDetail(id);
        };

        // Desktop e mobile: usar o mesmo modal/layout
        compareList.appendChild(desktopLayout);
    ensureCompareModalOpen();
        try {
            const shouldRestorePosition = !!(compareModal && compareModal.dataset.compareRestore === '1');
            const restoreProductId = compareModal ? (compareModal.dataset.compareRestoreProductId || '') : '';
            const restoreScrollRaw = compareModal ? (compareModal.dataset.compareRestoreScrollTop || '') : '';
            const restoreScrollTop = Number(restoreScrollRaw);
            const applyInitialComparePosition = () => {
                if (shouldRestorePosition) {
                    if (Number.isFinite(restoreScrollTop) && restoreScrollTop >= 0) {
                        compareList.scrollTop = restoreScrollTop;
                        if (compareModalContent) compareModalContent.scrollTop = restoreScrollTop;
                    }
                    if (restoreProductId) {
                        const restoreNode = Array.from(compareList.querySelectorAll('[data-product-id]'))
                            .find(node => String(node.dataset.productId) === String(restoreProductId));
                        if (restoreNode && typeof restoreNode.scrollIntoView === 'function') {
                            restoreNode.scrollIntoView({ block: 'center', inline: 'nearest' });
                        }
                    }
                    return;
                }

                compareList.scrollTop = 0;
                if (compareModalContent) compareModalContent.scrollTop = 0;
                const firstHighlight = compareList.querySelector('.compare-highlight-card');
                if (firstHighlight && typeof firstHighlight.scrollIntoView === 'function') {
                    firstHighlight.scrollIntoView({ block: 'start', inline: 'nearest' });
                }
            };

            requestAnimationFrame(() => {
                applyInitialComparePosition();
            });
            setTimeout(() => {
                applyInitialComparePosition();

                if (shouldRestorePosition && compareModal) {
                    delete compareModal.dataset.compareRestore;
                    delete compareModal.dataset.compareRestoreProductId;
                    delete compareModal.dataset.compareRestoreScrollTop;
                }
            }, 80);
        } catch (_) { /* noop */ }
        return;

        // ===== Mantém fluxo ANTIGO para mobile abaixo =====
        privateLabel.sort((a,b) => parseFloat(a.price) - parseFloat(b.price));
        branded.sort((a,b) => parseFloat(a.price) - parseFloat(b.price));
        const limitedPrivateLabel = privateLabel.slice(0, 3);
        const limitedBranded = branded.slice(0, 6);
        const columnsWrap = document.createElement('div');
        columnsWrap.className = 'compare-columns';

    const leftCol = document.createElement('div');
    leftCol.className = 'compare-column col-private';
    // add semantic classes used by CSS for visual separation
    leftCol.classList.add('private-label');
        const leftHeader = document.createElement('div'); leftHeader.className = 'category-header'; leftHeader.innerHTML = `<span>Marca Branca</span> <span class="count">${limitedPrivateLabel.length}</span>`;
        leftCol.appendChild(leftHeader);
        const leftGrid = document.createElement('div'); leftGrid.className = 'compare-grid';

    const rightCol = document.createElement('div');
    rightCol.className = 'compare-column col-branded';
    // add semantic classes used by CSS for visual separation
    rightCol.classList.add('branded');
        const rightHeader = document.createElement('div'); rightHeader.className = 'category-header'; rightHeader.innerHTML = `<span>Marcas</span> <span class="count">${limitedBranded.length}</span>`;
        rightCol.appendChild(rightHeader);
        const rightGrid = document.createElement('div'); rightGrid.className = 'compare-grid';

        // helpers to create a card
        const makeCard = (item, highest, cheapestInGroup) => {
            const esc = (s) => (s || '').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            const pct = (highest && parseFloat(highest.price) > 0) ? Math.round(((parseFloat(highest.price) - parseFloat(item.price)) / parseFloat(highest.price)) * 100) : 0;
            const isCheapest = cheapestInGroup && String(item.id) === String(cheapestInGroup.id);
            const card = document.createElement('div');
            card.className = 'compare-card compare-item';
            card.dataset.productId = item.id;
            card.innerHTML = `
                <div class="compare-card-grid">
                    <div class="card-image-col">
                        ${isCheapest ? '<span class="selo-mais-barato">Mais barato</span>' : ''}
                        <img src="${esc(item.imageUrl || DEFAULT_IMAGE_URL)}" alt="${esc(item.name)}" class="compare-card-image">
                    </div>
                    <div class="card-main-col">
                        <div class="card-main-top">
                            <!-- badge removed per request -->
                        </div>
                        <div class="compare-card-price">${formatPrice(item.price)}</div>
                        <div class="compare-card-market">${esc(item.market || 'Desconhecido')}</div>
                        <div class="compare-card-brand">${esc(item.brand || '')}</div>
                        <div class="compare-card-fullname" title="${esc(item.name)}">${esc(item.name)}</div>
                        <div class="icon-group">
                            <button class="fav-btn" data-id="${item.id}" title="Favoritar" aria-label="Favoritar"><i class="fas fa-heart"></i></button>
                            <button class="cart-btn" data-id="${item.id}" title="Adicionar ao carrinho" aria-label="Adicionar ao carrinho"><i class="fas fa-shopping-cart"></i></button>
                        </div>
                        <div class="card-actions-overlay" style="display:none;">
                            <button class="fav-btn" data-id="${item.id}" title="Favoritar">Favoritar</button>
                            <button class="cart-btn" data-id="${item.id}" title="Adicionar ao carrinho">Adicionar ao carrinho</button>
                        </div>
                    </div>
                </div>
            `;
            return card;
        };

        // populate left (private) then right (branded) - usar listas limitadas
        const highestPrivate2 = limitedPrivateLabel.length ? limitedPrivateLabel.reduce((h,it)=> parseFloat(it.price) > parseFloat(h.price) ? it : h, limitedPrivateLabel[0]) : null;
        const highestBranded2 = limitedBranded.length ? limitedBranded.reduce((h,it)=> parseFloat(it.price) > parseFloat(h.price) ? it : h, limitedBranded[0]) : null;

        limitedPrivateLabel.forEach(it => leftGrid.appendChild(makeCard(it, highestPrivate2, cheapestPrivate)));
        
        // Adicionar produtos de marca com separador
        limitedBranded.forEach((it, index) => {
            // Adicionar separador após os primeiros 3 produtos de marca
            if (index === 3 && limitedBranded.length > 3) {
                const separator = document.createElement('div');
                separator.className = 'compare-separator';
                separator.innerHTML = '<hr><span>Mais opções de marca</span><hr>';
                rightGrid.appendChild(separator);
            }
            rightGrid.appendChild(makeCard(it, highestBranded2, cheapestBranded));
        });

        leftCol.appendChild(leftGrid);
        rightCol.appendChild(rightGrid);
        columnsWrap.appendChild(leftCol);
        columnsWrap.appendChild(rightCol);

        // If on small screens, render the comparison as a full-page view instead of a modal
        if (typeof window !== 'undefined' && window.innerWidth <= 720) {
            openComparePage(productName, columnsWrap);
            return;
        }

        compareList.appendChild(columnsWrap);
    ensureCompareModalOpen();

        // Titles now display full product name (multi-line) per reference image.

        // clicking a card opens its details in-place inside the compare modal
        compareList.onclick = function (e) {
            // if click landed on the action buttons themselves, let the delegated handler process it
            if (e.target.closest('.fav-btn') || e.target.closest('.cart-btn')) return;
            const itemNode = e.target.closest('.compare-item');
            if (!itemNode) return;
            const id = itemNode.dataset.productId;
            if (!id) return;
            showCompareItemDetail(id);
        };
    };
    window.openCompareModal = openCompareModal;

    // expose compare action globally (used by scanner and modal action buttons)
    window.openCompareModal = openCompareModal;

    // Render compare as a full-page view (mobile UX) with back navigation
    const openComparePage = (productName, columnsWrap) => {
        // create or reuse container
        let comparePage = document.getElementById('compare-page');
        if (!comparePage) {
            comparePage = document.createElement('div');
            comparePage.id = 'compare-page';
            comparePage.className = 'compare-page';
            document.body.appendChild(comparePage);
        }
        // header + content + notice bar
        comparePage.innerHTML = `
            <div class="compare-page-header">
                <button id="compare-page-back" class="compare-page-back"><svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='15 18 9 12 15 6'/></svg> Voltar</button>
                <div class="compare-page-title">Comparar: ${productName}</div>
            </div>
            <div id="compare-action-notice" class="compare-action-notice" style="display:none"></div>
        `;
        const content = document.createElement('div');
        content.className = 'compare-page-content';
        content.appendChild(columnsWrap);
        comparePage.appendChild(content);

    // show and lock background scroll (use flex so header/content stack correctly)
    comparePage.style.display = 'flex';
    comparePage.style.flexDirection = 'column';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        // push history state so native back works
        try { history.pushState({ comparePage: true, product: productName }, '', '#compare'); } catch (e) { /* ignore */ }

        const onPop = (e) => {
            // if state no longer indicates compare page, close it
            if (!e.state || !e.state.comparePage) closeComparePage();
        };
        window.addEventListener('popstate', onPop);
        // store listener so we can remove later
        comparePage._onPop = onPop;

        // Bind delegated click actions for ALL cards in the mobile compare page
        // Always remove old listener and rebind fresh so all products are covered
        if (comparePage._onPageClick) {
            comparePage.removeEventListener('click', comparePage._onPageClick);
        }
        comparePage._onPageClick = (e) => {
            const btn = e.target.closest('.fav-btn, .cart-btn');
            if (btn) {
                e.stopPropagation();
                const id = btn.dataset && btn.dataset.id;
                if (!id) return;
                if (btn.classList.contains('fav-btn')) {
                    let favorites = getFromSessionStorage('favorites');
                    const isFav = favorites.some(f => String(f.id) === String(id));
                    if (isFav) { favorites = favorites.filter(f => String(f.id) !== String(id)); }
                    else { const product = getFromLocalStorage('products').find(p => String(p.id) === String(id)); if (product) favorites.push(product); }
                    saveToSessionStorage('favorites', favorites);
                    renderFavorites();
                    const nowFav = !isFav;
                    comparePage.querySelectorAll('.fav-btn[data-id="' + id + '"]').forEach(b => { b.classList.toggle('fav-active', nowFav); b.setAttribute('aria-pressed', String(nowFav)); });
                    const notice = document.getElementById('compare-action-notice');
                    if (notice) { notice.textContent = nowFav ? 'Adicionado aos favoritos' : 'Removido dos favoritos'; notice.className = 'compare-action-notice ' + (nowFav ? 'success' : 'info'); notice.style.display = 'block'; clearTimeout(notice._t); notice._t = setTimeout(()=> notice.style.display='none', 2500); }
                    try { showToast(nowFav ? 'Adicionado aos favoritos' : 'Removido dos favoritos', { type: 'info' }); } catch(_) {}
                    return;
                }
                if (btn.classList.contains('cart-btn')) {
                    const cart = getFromSessionStorage('cart');
                    const product = getFromLocalStorage('products').find(p => String(p.id) === String(id));
                    if (product) {
                        const existing = cart.find(i => String(i.id) === String(id));
                        if (existing) existing.quantity = (existing.quantity || 1) + 1;
                        else { const copy = Object.assign({}, product); copy.quantity = 1; cart.push(copy); }
                        saveToSessionStorage('cart', cart);
                        renderCartItems();
                        comparePage.querySelectorAll('.cart-btn[data-id="' + id + '"]').forEach(b => { b.classList.add('adicionado', 'in-cart'); b.setAttribute('aria-pressed', 'true'); });
                        const notice = document.getElementById('compare-action-notice');
                        if (notice) { notice.textContent = product.name + ' adicionado ao carrinho'; notice.className = 'compare-action-notice success'; notice.style.display = 'block'; clearTimeout(notice._t); notice._t = setTimeout(()=> notice.style.display='none', 2500); }
                        try { showToast(product.name + ' adicionado ao carrinho', { type: 'success' }); } catch(_) {}
                    }
                    return;
                }
                return;
            }
            const card = e.target.closest('.compare-linear-item, .compare-highlight-card, .compare-card, .compare-item');
            if (card) {
                const pid = card.dataset.productId;
                if (pid && typeof window.openProductDetail === 'function') { window.openProductDetail(pid); }
            }
        };
        comparePage.addEventListener('click', comparePage._onPageClick);
        comparePage._onFavCart = comparePage._onPageClick;
        // ensure columnsWrap fills the container
        try { columnsWrap.style.width = '100%'; columnsWrap.style.boxSizing = 'border-box'; } catch (e) { /* ignore if not settable */ }

        // Skip legacy fallback conversions if we already passed a purpose-built mobile layout
        const isNewMobileLayout = columnsWrap && columnsWrap.classList && columnsWrap.classList.contains('compare-mobile-redesign');
        if (!isNewMobileLayout) {
            // If the complex grid layout isn't rendered correctly on some devices,
            // fall back to a simple stacked mobile list by moving all card nodes
            // into a single column container for reliable visibility.
            try {
                const allCards = columnsWrap.querySelectorAll('.compare-card, .compare-item');
                if (allCards && allCards.length > 0) {
                    // create a mobile list container
                    const mobileList = document.createElement('div');
                    mobileList.className = 'mobile-compare-list';
                    // move each card into the mobile list (this detaches them from their original parent)
                    allCards.forEach(c => {
                        // ensure card displays as block-level full width
                        try { c.style.width = '100%'; c.style.boxSizing = 'border-box'; } catch (e) {}
                        mobileList.appendChild(c);
                    });
                    // clear columnsWrap content and append the simple list
                    columnsWrap.innerHTML = '';
                    columnsWrap.appendChild(mobileList);
                }
            } catch (err) {
                // if anything fails, silently continue — we still have the original columnsWrap
                console.error('Fallback to mobile list failed:', err);
            }
        }

    const backBtn = document.getElementById('compare-page-back');
        if (backBtn) backBtn.onclick = () => { closeComparePage(); };

        // If nothing is visible and we are not using the new mobile layout, rebuild a simple list from data
        if (!isNewMobileLayout) {
            try {
                const visibleCard = comparePage.querySelector('.compare-card, .compare-item');
                const isVisible = visibleCard && (visibleCard.offsetHeight > 0 || visibleCard.getClientRects().length > 0);
                if (!isVisible) {
                    const mobileList = document.createElement('div');
                    mobileList.className = 'mobile-compare-list';
                    const appendCardFromData = (item) => {
                        const card = document.createElement('div');
                        card.className = 'compare-card compare-item';
                        card.dataset.productId = item.id;
                        card.innerHTML = `
                            <div class="card-image-col"><img src="${item.imageUrl || DEFAULT_IMAGE_URL}" class="compare-card-image" alt="${item.name}"></div>
                            <div class="card-main-col">
                                <div class="compare-card-price">${formatPrice(item.price)}</div>
                                <div class="compare-card-market">${item.market || ''}</div>
                                <div class="compare-card-brand">${item.brand || ''}</div>
                                <div class="compare-card-fullname" title="${item.name}">${item.name}</div>
                            </div>
                            <div class="icon-group">
                                <button class="fav-btn" data-id="${item.id}" title="Favoritar">❤</button>
                                <button class="cart-btn" data-id="${item.id}" title="Adicionar">🛒</button>
                            </div>
                        `;
                        mobileList.appendChild(card);
                    };
                    try {
                        if (privateLabel && privateLabel.length) {
                            const hdr = document.createElement('div'); hdr.className = 'mobile-group-header'; hdr.textContent = `Marca Branca (${privateLabel.length})`;
                            mobileList.appendChild(hdr);
                            privateLabel.forEach(appendCardFromData);
                        }
                        if (branded && branded.length) {
                            const hdr2 = document.createElement('div'); hdr2.className = 'mobile-group-header'; hdr2.textContent = `Marcas (${branded.length})`;
                            mobileList.appendChild(hdr2);
                            branded.forEach(appendCardFromData);
                        }
                    } catch (err) { /* fallback: do nothing */ }
                    const contentNode = comparePage.querySelector('.compare-page-content');
                    if (contentNode) { contentNode.innerHTML = ''; contentNode.appendChild(mobileList); }
                }
            } catch (err) { console.error('Error rebuilding mobile compare list:', err); }
        }
    };

    const closeComparePage = () => {
        const comparePage = document.getElementById('compare-page');
        if (!comparePage) return;
        if (comparePage._onPop) window.removeEventListener('popstate', comparePage._onPop);
        comparePage.style.display = 'none';
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        setTimeout(() => { comparePage.innerHTML = ''; try { if (location.hash === '#compare') history.replaceState({}, '', location.pathname + location.search); } catch(e){} }, 50);
    };



    // show product details inside the compare modal (replaces compare content)
    let __closeCompareImageZoom = () => {};
    const isCompareImageZoomOpen = () => {
        const zoomModal = document.getElementById('compare-image-zoom-modal');
        if (!zoomModal) return false;
        return zoomModal.classList.contains('show') && zoomModal.style.display !== 'none';
    };

    const ensureCompareImageZoomModal = () => {
        let zoomModal = document.getElementById('compare-image-zoom-modal');
        if (zoomModal) return zoomModal;

        zoomModal = document.createElement('div');
        zoomModal.id = 'compare-image-zoom-modal';
        zoomModal.className = 'compare-image-zoom-modal';
        zoomModal.setAttribute('role', 'dialog');
        zoomModal.setAttribute('aria-modal', 'true');
        zoomModal.setAttribute('aria-label', 'Imagem ampliada do produto');
        zoomModal.innerHTML = `
            <button class="compare-image-zoom-close" aria-label="Voltar para detalhes">← Voltar</button>
            <img class="compare-image-zoom-img" alt="Imagem ampliada do produto">
        `;
        document.body.appendChild(zoomModal);

        const closeZoom = () => {
            zoomModal.classList.remove('show');
            zoomModal.style.display = 'none';
        };
        __closeCompareImageZoom = closeZoom;

        const closeBtn = zoomModal.querySelector('.compare-image-zoom-close');
        if (closeBtn) {
            closeBtn.addEventListener('pointerup', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                closeZoom();
            });
            closeBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                closeZoom();
            });
            closeBtn.addEventListener('touchstart', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
            }, { passive: false });
            closeBtn.addEventListener('touchend', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                closeZoom();
            }, { passive: false });
        }
        zoomModal.addEventListener('click', (ev) => {
            if (ev.target === zoomModal) {
                ev.preventDefault();
                ev.stopPropagation();
                closeZoom();
            }
        });
        zoomModal.addEventListener('touchend', (ev) => {
            if (ev.target === zoomModal) {
                ev.preventDefault();
                ev.stopPropagation();
                closeZoom();
            }
        }, { passive: false });
        window.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape' && zoomModal.classList.contains('show')) closeZoom();
        });

        return zoomModal;
    };

    const openCompareImageZoom = (src, alt) => {
        if (!src) return;
        const zoomModal = ensureCompareImageZoomModal();
        const img = zoomModal.querySelector('.compare-image-zoom-img');
        if (!img) return;
        img.src = src;
        img.alt = alt || 'Imagem ampliada do produto';
        zoomModal.style.display = 'flex';
        requestAnimationFrame(() => zoomModal.classList.add('show'));
    };

    const showCompareItemDetail = (productId) => {
        const products = getFromLocalStorage('products');
        const p = products.find(x => String(x.id) === String(productId));
        if (!p) return;
        const compareModalContent = compareModal ? compareModal.querySelector('.modal-content') : null;

        setCompareTopBackMode('detail');

        if (compareModal) {
            compareModal.dataset.compareReturnProductId = String(productId || '');
            compareModal.dataset.compareReturnScrollTop = String(compareList ? (compareList.scrollTop || 0) : 0);
        }

        const esc = (s) => (s || '').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const detailCountriesMeta = __pjGetProductCountriesMeta(p);
        const detailCountryHtml = detailCountriesMeta
            .map(item => __pjBuildCountryDisplayHtml(item, { showName: true, imgSize: 16, gap: 6, fallbackSize: 13 }))
            .filter(Boolean)
            .join('<span style="opacity:.55;padding:0 4px;">•</span>');
        const detailMarketLogo = __pjFindMarketLogo(p.market || '');
        const detailMarketHtml = detailMarketLogo
            ? `<img src="${esc(detailMarketLogo)}" alt="Logo ${esc(p.market || '')}" style="width:52px;height:52px;object-fit:contain;border:1px solid #e5e7eb;border-radius:8px;background:#fff;padding:4px;vertical-align:middle;" loading="lazy" decoding="async">`
            : esc(p.market || '—');

        const detailUnit = `${esc(p.quantity || '')} ${esc(p.unit || '')}`.trim() || '—';

        // update title and render a compact detail view inside the compare list container
        compareTitle.textContent = `Detalhes: ${p.name}`;
        try {
            compareList.scrollTop = 0;
            if (compareModalContent) compareModalContent.scrollTop = 0;
        } catch (_) { /* noop */ }
        compareList.innerHTML = `
            <div class="compare-detail">
                <div class="compare-detail-grid">
                    <div class="detail-image-col">
                        <img src="${esc(p.imageUrl || DEFAULT_IMAGE_URL)}" alt="${esc(p.name)}" class="detail-image">
                    </div>
                    <div class="detail-info-col">
                        <h3 class="detail-name">${esc(p.name)}</h3>
                        <div class="detail-price">${formatPrice(p.price)}</div>
                        <div class="detail-meta">
                            <div><strong>Mercado:</strong> ${detailMarketHtml}</div>
                            <div><strong>Marca:</strong> ${esc(p.brand || '—')}</div>
                            <div><strong>Categoria:</strong> ${esc(p.category || '—')}</div>
                            <div><strong>Unidade:</strong> ${detailUnit}</div>
                            <div><strong>País:</strong> ${detailCountryHtml || '—'}</div>
                        </div>
                        <p class="detail-description">${esc(p.description || '')}</p>
                        <div class="detail-actions">
                            <button class="fav-btn" data-id="${p.id}" title="Favoritar"><i class="fas fa-heart"></i> Favoritar</button>
                            <button class="cart-btn" data-id="${p.id}" title="Adicionar ao carrinho"><i class="fas fa-shopping-cart"></i> Adicionar ao carrinho</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        try {
            requestAnimationFrame(() => {
                compareList.scrollTop = 22;
                if (compareModalContent) compareModalContent.scrollTop = 22;
            });
            setTimeout(() => {
                compareList.scrollTop = 22;
                if (compareModalContent) compareModalContent.scrollTop = 22;
            }, 80);
        } catch (_) { /* noop */ }

        const detailImg = compareList.querySelector('.detail-image');
        if (detailImg) {
            detailImg.style.cursor = 'zoom-in';
        }

    };

    if (closeCompareBtn) closeCompareBtn.addEventListener('click', (e) => {
        try {
            e.preventDefault();
            e.stopPropagation();
        } catch (_) { /* noop */ }

        const view = (compareModal && compareModal.dataset.compareView) ? compareModal.dataset.compareView : 'list';

        if (isCompareImageZoomOpen()) {
            try { __closeCompareImageZoom(); } catch (_) { /* noop */ }
            return;
        }

        if (view === 'detail') {
            const currentProductId = compareModal ? (compareModal.dataset.compareReturnProductId || '') : '';
            const original = (compareModal && compareModal.dataset.compareProduct)
                ? compareModal.dataset.compareProduct
                : ((compareTitle && compareTitle.textContent)
                    ? compareTitle.textContent.replace(/^Detalhes:\s*/i, '').trim()
                    : '');

            if (compareModal) {
                compareModal.dataset.compareRestore = '1';
                compareModal.dataset.compareRestoreProductId = currentProductId;
                compareModal.dataset.compareRestoreScrollTop = compareModal.dataset.compareReturnScrollTop || '0';
            }

            openCompareModal(original, { preserveReturnContext: true });
            return;
        }

        const prevType = compareModal ? (compareModal.dataset.comparePrevType || 'page') : 'page';
        const prevProductId = compareModal ? (compareModal.dataset.comparePrevProductId || '') : '';

        closeModal(compareModal);

        if (prevType === 'product-modal' && prevProductId) {
            setTimeout(() => {
                try { openProductDetail(prevProductId); } catch (_) { /* noop */ }
            }, 260);
        }
    });

    // Delegated events inside compare modal for fav/cart
    compareList.addEventListener('click', (e) => {
        const detailImg = e.target.closest('.detail-image');
        if (detailImg) {
            e.preventDefault();
            e.stopPropagation();
            openCompareImageZoom(detailImg.currentSrc || detailImg.src, detailImg.alt || 'Imagem ampliada do produto');
            return;
        }
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.dataset.id;
        if (!id) return;
        if (btn.classList.contains('fav-btn')) {
            let favorites = getFromSessionStorage('favorites');
            const isFav = favorites.some(f => f.id == id);
            if (isFav) {
                favorites = favorites.filter(f => f.id != id);
            } else {
                const product = getFromLocalStorage('products').find(p => p.id == id);
                if (product) favorites.push(product);
            }
            saveToSessionStorage('favorites', favorites);
            // toggle active class and aria
            const nowFav = !isFav;
            btn.classList.toggle('fav-active', nowFav);
            btn.setAttribute('aria-pressed', String(nowFav));
            renderFavorites();
            renderProducts();
            // show toast only when adding (fallback to alert)
            if (!isFav) {
                const added = getFromLocalStorage('products').find(p => String(p.id) === String(id));
                if (added) {
                    try { showToast(`${added.name} adicionado aos favoritos!`, { type: 'success' }); }
                    catch (_) { alert(`${added.name} adicionado aos favoritos!`); }
                }
            }
        } else if (btn.classList.contains('cart-btn')) {
            const cart = getFromSessionStorage('cart');
            const product = getFromLocalStorage('products').find(p => p.id == id);
            if (product) {
                const existing = cart.find(i => i.id == id);
                if (existing) existing.quantity = (existing.quantity || 1) + 1;
                else { product.quantity = 1; cart.push(product); }
                saveToSessionStorage('cart', cart);
                renderCartItems();
                // toggle visual state on the button to indicate added
                btn.classList.add('adicionado','in-cart');
                btn.setAttribute('aria-pressed','true');
                try { showToast(`${product.name} adicionado ao carrinho!`, { type: 'success' }); }
                catch (_) { alert(`${product.name} adicionado ao carrinho!`); }
            }
        }
    });

    compareList.addEventListener('touchend', (e) => {
        const detailImg = e.target.closest('.detail-image');
        if (!detailImg) return;
        e.preventDefault();
        e.stopPropagation();
        openCompareImageZoom(detailImg.currentSrc || detailImg.src, detailImg.alt || 'Imagem ampliada do produto');
    }, { passive: false });

    const renderRecentProducts = () => {
        if (!recentProductsList) return;
        const MAX_RECENT_PRODUCTS = 6;
        const products = getFromLocalStorage('products');
        const sorted = [...products].sort((a, b) => { const da = a.dateAdded ? new Date(a.dateAdded) : new Date(0); const db = b.dateAdded ? new Date(b.dateAdded) : new Date(0); return db - da; });
        const recentToShow = sorted.slice(0, MAX_RECENT_PRODUCTS);
        recentProductsList.innerHTML = '';
        if (recentToShow.length === 0) {
            if (noRecentProductsMessage) noRecentProductsMessage.style.display = 'block';
        } else {
            if (noRecentProductsMessage) noRecentProductsMessage.style.display = 'none';
            recentToShow.forEach(product => {
                const productCard = createProductCard(product);
                recentProductsList.appendChild(productCard);
            });
        }
    };

    // Lógica para Favoritos

    // Lógica para Favoritos
    const renderFavorites = () => {
        const favorites = getFromSessionStorage('favorites');
        favoritesList.innerHTML = '';
        if (favorites.length === 0) {
            noFavoritesMessage.style.display = 'block';
        } else {
            noFavoritesMessage.style.display = 'none';
            favorites.forEach(product => {
                const listItem = createFavoriteListItem(product);
                favoritesList.appendChild(listItem);
            });
        }
    };

    // Lógica para o Histórico de Pesquisa
    const renderSearchHistory = () => {
        const history = getFromSessionStorage('searchHistory');
        searchHistoryList.innerHTML = '';
        if (!history || history.length === 0) {
            // show no-history-message when there is truly no history
            const noHistoryMsg = document.getElementById('no-history-message');
            if (noHistoryMsg) noHistoryMsg.style.display = 'block';
            return;
        } else {
            const noHistoryMsg = document.getElementById('no-history-message');
            if (noHistoryMsg) noHistoryMsg.style.display = 'none';
        }

        history.forEach(term => {
            const tag = document.createElement('span');
            tag.classList.add('search-tag');
            tag.textContent = term;
            tag.addEventListener('click', () => {
                // when clicking a history tag: run the search, keep term in history, then clear input
                let hist = getFromSessionStorage('searchHistory');
                hist = hist.filter(h => h.toLowerCase() !== term.toLowerCase());
                hist.unshift(term);
                hist = hist.slice(0, 10);
                saveToSessionStorage('searchHistory', hist);
                renderSearchHistory();
                productSearchBar.value = term;
                filterProducts();
                // update last searched badge
                if (typeof setLastSearched === 'function') setLastSearched(term);
                // keep the searched term in the input so the user can edit or clear manually
            });
            searchHistoryList.appendChild(tag);
        });
    };

    // Lógica para o Carrinho de Compras
    const updateCartTotal = () => {
        const cart = getFromSessionStorage('cart');
        const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        cartTotalElement.textContent = formatPrice(total);
        emptyCartMessage.style.display = cart.length === 0 ? 'block' : 'none';
    };

    const renderCartItems = () => {
        const cart = getFromSessionStorage('cart');
        cartItemsList.innerHTML = '';
        const selectedMarket = cartMarketFilter ? (cartMarketFilter.value || 'all') : 'all';

        if (!cart || cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            if (cartMarketBreakdown) cartMarketBreakdown.innerHTML = '';
            if (cartMarketFilter) {
                cartMarketFilter.innerHTML = '<option value="all">Todos os mercados</option>';
                cartMarketFilter.value = 'all';
            }
            return updateCartTotal();
        }

        emptyCartMessage.style.display = 'none';

        // Agrupa por mercado
        const groups = cart.reduce((acc, item) => {
            const market = item.market || 'Outros';
            if (!acc[market]) acc[market] = [];
            acc[market].push(item);
            return acc;
        }, {});

        updateCartMarketFilterOptions(groups, selectedMarket);

        let grandTotal = 0;
        const marketTotals = {};

        Object.keys(groups).sort((a, b) => a.localeCompare(b, 'pt-PT')).forEach(market => {
            const items = groups[market];
            const marketSubtotal = items.reduce((sum, it) => sum + (parseFloat(it.price) * (it.quantity || 1)), 0);
            marketTotals[market] = marketSubtotal;
            grandTotal += marketSubtotal;

            if (cartMarketFilter && cartMarketFilter.value !== 'all' && cartMarketFilter.value !== market) {
                return;
            }

            const accent = getMarketAccentColor(market);
            const marketBlock = document.createElement('section');
            marketBlock.className = 'cart-market-group';
            marketBlock.style.setProperty('--market-accent', accent);

            // Cabeçalho do mercado
            const marketHeader = document.createElement('div');
            marketHeader.className = 'cart-market-header';
            marketHeader.innerHTML = `<h4 class="market-name"><i class="fas fa-store"></i> ${market}</h4>`;
            marketBlock.appendChild(marketHeader);

            // Lista de itens deste mercado
            items.forEach(item => {
                const cartItem = createModalListItem(item, true);
                marketBlock.appendChild(cartItem);
            });

            // Subtotal do mercado
            const subtotalNode = document.createElement('div');
            subtotalNode.className = 'market-subtotal';
            subtotalNode.innerHTML = `<div class="subtotal-row"><span>Subtotal ${market}:</span><strong>${formatPrice(marketSubtotal)}</strong></div>`;
            marketBlock.appendChild(subtotalNode);
            cartItemsList.appendChild(marketBlock);
        });

        if (!cartItemsList.children.length && cartMarketFilter && cartMarketFilter.value !== 'all') {
            const emptyMarketNode = document.createElement('p');
            emptyMarketNode.className = 'empty-message';
            emptyMarketNode.textContent = 'Não há itens para este mercado no carrinho.';
            cartItemsList.appendChild(emptyMarketNode);
        }

        renderCartMarketBreakdown(marketTotals, grandTotal);

        // Total geral ao final da lista
        const totalNode = document.createElement('div');
        totalNode.className = 'cart-grand-total';
        totalNode.innerHTML = `<div class="grand-total-row"><span>Total Geral:</span><strong>${formatPrice(grandTotal)}</strong></div>`;
        cartItemsList.appendChild(totalNode);

        // Atualiza o resumo do carrinho (elemento existente)
        cartTotalElement.textContent = formatPrice(grandTotal);
    };

    if (cartMarketFilter) {
        cartMarketFilter.addEventListener('change', () => {
            renderCartItems();
        });
    }

    // Lógica de Filtros e Busca
    const filterProducts = () => {
        const products = getFromLocalStorage('products'); // Os produtos base vêm do localStorage
        
        // Pegar o termo de pesquisa de ambos os campos
        const nameSearchTerm = productSearchBar.value.toLowerCase();
        const barcodeSearchTerm = barcodeSearchBar ? barcodeSearchBar.value.toLowerCase() : '';
        
        // Usar qualquer um dos termos que estiver preenchido
        const searchTerm = barcodeSearchTerm || nameSearchTerm;
        
        const marketValue = marketFilter.value;
        const brandValue = brandFilter.value;
        const categoryValue = categoryFilter.value;

        const filtered = products.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const barcodeMatch = product.barcode && product.barcode.toString().includes(searchTerm);
            const searchMatch = nameMatch || barcodeMatch;
            const marketMatch = !marketValue || marketValue === "" || product.market === marketValue;
            const brandMatch = !brandValue || brandValue === "" || product.brand === brandValue;
            const categoryMatch = !categoryValue || categoryValue === "" || product.category === categoryValue;
            return searchMatch && marketMatch && brandMatch && categoryMatch;
        });

        renderProducts(filtered);
        // if any products are rendered, hide the no-history-message
        const noHistoryMsg = document.getElementById('no-history-message');
        if (noHistoryMsg) {
            if (filtered && filtered.length > 0) {
                noHistoryMsg.style.display = 'none';
            } else {
                // show no-history only if there is no saved history either
                const history = getFromSessionStorage('searchHistory');
                if (!history || history.length === 0) noHistoryMsg.style.display = 'block';
                else noHistoryMsg.style.display = 'none';
            }
        }
    };

    // Função específica para pesquisa por código de barras
    const filterProductsByBarcode = (barcodeQuery) => {
        const products = getFromLocalStorage('products');
        const marketValue = marketFilter.value;
        const brandValue = brandFilter.value;
        const categoryValue = categoryFilter.value;

        const filtered = products.filter(product => {
            const barcodeMatch = barcodeQuery ? (product.barcode && product.barcode.toString().includes(barcodeQuery)) : true;
            const marketMatch = !marketValue || marketValue === "" || product.market === marketValue;
            const brandMatch = !brandValue || brandValue === "" || product.brand === brandValue;
            const categoryMatch = !categoryValue || categoryValue === "" || product.category === categoryValue;
            return barcodeMatch && marketMatch && brandMatch && categoryMatch;
        });

        renderProducts(filtered);
        // if any products are rendered, hide the no-history-message
        const noHistoryMsg = document.getElementById('no-history-message');
        if (noHistoryMsg) {
            if (filtered && filtered.length > 0) {
                noHistoryMsg.style.display = 'none';
            } else {
                // show no-history only if there is no saved history either
                const history = getFromSessionStorage('searchHistory');
                if (!history || history.length === 0) noHistoryMsg.style.display = 'block';
                else noHistoryMsg.style.display = 'none';
            }
        }
    };

    const updateFilterOptions = () => {
        const products = getFromLocalStorage('products');
        const markets = [...new Set(products.map(p => p.market))].sort();
        const brands = [...new Set(products.map(p => p.brand))].sort();
        const categories = [...new Set(products.map(p => p.category))].sort();
        
        marketFilter.innerHTML = `<option value="">Todos os Mercados</option>${markets.map(m => `<option value="${m}">${m}</option>`).join('')}`;
        brandFilter.innerHTML = `<option value="">Todas as Marcas</option>${brands.map(b => `<option value="${b}">${b}</option>`).join('')}`;
        categoryFilter.innerHTML = `<option value="">Todas as Categorias</option>${categories.map(c => `<option value="${c}">${c}</option>`).join('')}`;
    };
    
    // Tornar disponível globalmente
    window.updateFilterOptions = updateFilterOptions;

    // Helper to display last searched term
    const lastSearchedEl = document.getElementById('last-searched');
    const setLastSearched = (term) => {
        if (!lastSearchedEl) return;
        if (!term) {
            lastSearchedEl.textContent = '';
            sessionStorage.removeItem('lastSearched');
            return;
        }
        lastSearchedEl.textContent = `Última: ${term}`;
        saveToSessionStorage('lastSearched', term);
    };

    // Eventos
    productSearchBar.addEventListener('input', (e) => {
        const q = e.target.value || '';
        if (!q.trim()) {
            // when input cleared, show all products
            renderProducts();
            if (historyDropdown) historyDropdown.style.display = 'none';
            setLastSearched(getFromSessionStorage('lastSearched'));
        } else {
            filterProducts();
            showHistoryDropdown(q);
        }
    });
    // Ao pressionar Enter no campo de pesquisa, salvar no histórico e mostrar seção
    productSearchBar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const term = productSearchBar.value.trim();
            if (term) {
                let history = getFromSessionStorage('searchHistory');
                // evita duplicados recentes
                history = history.filter(h => h.toLowerCase() !== term.toLowerCase());
                history.unshift(term);
                // mantém apenas últimos 10
                history = history.slice(0, 10);
                saveToSessionStorage('searchHistory', history);
                renderSearchHistory();
                setLastSearched(term);
                // run the search, then clear the input so it disappears for next typing
                filterProducts();
                const historySection = document.getElementById('search-history-section');
                if (historySection) historySection.scrollIntoView({ behavior: 'smooth' });
                // clear and focus so the typed term 'sums' from the input on all devices
                // keep the searched term in the input so the user can edit or clear manually
            }
        }
    });

    // CLONE EXATO - Eventos para campo de código de barras
    barcodeSearchBar.addEventListener('input', (e) => {
        const q = e.target.value || '';
        if (!q.trim()) {
            // when input cleared, show all products
            renderProducts();
            const barcodeHistoryDropdown = document.getElementById('history-dropdown-barcode');
            if (barcodeHistoryDropdown) barcodeHistoryDropdown.style.display = 'none';
            setLastSearched(getFromSessionStorage('lastSearched'));
        } else {
            filterProducts();
            showHistoryDropdown(q);
        }
    });
    
    // CLONE EXATO - Ao pressionar Enter no campo de código de barras
    barcodeSearchBar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const term = barcodeSearchBar.value.trim();
            if (term) {
                let history = getFromSessionStorage('searchHistory');
                // evita duplicados recentes
                history = history.filter(h => h.toLowerCase() !== term.toLowerCase());
                history.unshift(term);
                // mantém apenas últimos 10
                history = history.slice(0, 10);
                saveToSessionStorage('searchHistory', history);
                renderSearchHistory();
                setLastSearched(term);
                // run the search, then clear the input so it disappears for next typing
                filterProducts();
                const historySection = document.getElementById('search-history-section');
                if (historySection) historySection.scrollIntoView({ behavior: 'smooth' });
                // clear and focus so the typed term 'sums' from the input on all devices
                // keep the searched term in the input so the user can edit or clear manually
            }
        }
    });

    marketFilter.addEventListener('change', filterProducts);
    brandFilter.addEventListener('change', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);

    // OBS: o card já possui listener próprio em createProductCard.
    // Não duplicar aqui para evitar abrir o modal 2x e perder a posição do scroll.

    // Botão de pesquisar (se for adicionado futuramente): caso exista, faz mesma ação do Enter
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            const term = productSearchBar.value.trim();
            if (!term) return;
            let history = getFromSessionStorage('searchHistory');
            history = history.filter(h => h.toLowerCase() !== term.toLowerCase());
            history.unshift(term);
            history = history.slice(0, 10);
            saveToSessionStorage('searchHistory', history);
            renderSearchHistory();
            // run the search and then clear the input for next term
            filterProducts();
            if (typeof setLastSearched === 'function') setLastSearched(term);
            const historySection = document.getElementById('search-history-section');
            if (historySection) historySection.scrollIntoView({ behavior: 'smooth' });
            // keep the searched term in the input so the user can edit or clear manually
        });
    }

    // CLONE EXATO - Botão de pesquisar por código de barras
    const barcodeSearchButton = document.getElementById('barcode-search-button');
    if (barcodeSearchButton) {
        barcodeSearchButton.addEventListener('click', (e) => {
            e.preventDefault();
            const term = barcodeSearchBar.value.trim();
            if (!term) return;
            let history = getFromSessionStorage('searchHistory');
            history = history.filter(h => h.toLowerCase() !== term.toLowerCase());
            history.unshift(term);
            history = history.slice(0, 10);
            saveToSessionStorage('searchHistory', history);
            renderSearchHistory();
            // run the search and then clear the input for next term
            filterProducts();
            if (typeof setLastSearched === 'function') setLastSearched(term);
            const historySection = document.getElementById('search-history-section');
            if (historySection) historySection.scrollIntoView({ behavior: 'smooth' });
            // keep the searched term in the input so the user can edit or clear manually
        });
    }

    // Limpar histórico de pesquisa
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveToSessionStorage('searchHistory', []);
            renderSearchHistory();
            if (historyDropdown) historyDropdown.style.display = 'none';
            // clear the search input and show all products
            if (productSearchBar) { productSearchBar.value = ''; productSearchBar.focus(); }
            renderProducts();
        });
    }

    document.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button');
        if (!targetBtn) return;
        
        const productId = targetBtn.dataset.id;
        let products = getFromLocalStorage('products'); // Produtos base
        let product = products.find(p => p.id == productId);

        if (!product) {
             let cart = getFromSessionStorage('cart');
             product = cart.find(p => p.id == productId);
        }
        
        if (!product) return;

        if (targetBtn.classList.contains('favorite-btn')) {
            let favorites = getFromSessionStorage('favorites');
            const isFavorite = favorites.some(fav => fav.id === product.id);

            if (isFavorite) {
                favorites = favorites.filter(fav => fav.id !== product.id);
                targetBtn.classList.remove('active');
            } else {
                favorites.push(product);
                targetBtn.classList.add('active');
            }
            saveToSessionStorage('favorites', favorites);
            renderFavorites();
            renderProducts();
        }

        if (targetBtn.classList.contains('add-to-cart-btn')) {
            const cart = getFromSessionStorage('cart');
            const allProducts = getFromLocalStorage('products') || [];
            
            // Lógica para capturar todos os itens de nome similar
            const norm = (s) => (s || '').toString().toLowerCase().trim();
            const baseName = norm(product.name);
            const similarProducts = allProducts.filter(p => norm(p.name) === baseName);
            
            const toAdd = similarProducts.length > 0 ? similarProducts : [product];
            toAdd.forEach(simProd => {
                const existingItem = cart.find(item => item.id === simProd.id);
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    simProd.quantity = 1;
                    cart.push(simProd);
                }
            });

            saveToSessionStorage('cart', cart);
            
            if (toAdd.length > 1) {
                const msg = `${toAdd.length} produtos de nome similar a "${product.name}" adicionados ao carrinho!`;
                try {
                    const notice = document.getElementById('compare-action-notice');
                    if (notice) { notice.textContent = msg; notice.className = 'compare-action-notice success'; notice.style.display = 'block'; clearTimeout(notice._t); notice._t = setTimeout(()=> notice.style.display='none', 3000); }
                } catch(_) {}
                alert(msg);
            } else {
                alert(`${product.name} adicionado ao carrinho!`);
            }
            
            if (typeof renderCartItems === 'function') renderCartItems();
        }

        if (targetBtn.classList.contains('suggest-price-btn')) {
            modalSuggestionProductId.value = product.id;
            modalSuggestionProductName.value = product.name || '';
            modalSuggestionMarket.value = product.market || '';
                // zona removida: apenas preço editável conforme solicitado
            // Apenas o campo de preço fica editável - os demais permanecem disabled no HTML
            modalSuggestionNewPrice.value = product.price ? parseFloat(product.price).toFixed(2) : '';
            openModal(suggestionModal);
        }
    });

    // Eventos específicos dos modais
    cartItemsList.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button');
        if (!targetBtn) return;

        const productId = targetBtn.dataset.id;
        let cart = getFromSessionStorage('cart');
        const item = cart.find(i => i.id == productId);
        if (!item) return;

        if (targetBtn.classList.contains('remove-from-cart-btn')) {
            cart = cart.filter(i => i.id != productId);
            saveToSessionStorage('cart', cart);
            renderCartItems();
        } else if (targetBtn.classList.contains('quantity-plus-btn')) {
            item.quantity++;
            saveToSessionStorage('cart', cart);
            renderCartItems();
        } else if (targetBtn.classList.contains('quantity-minus-btn')) {
            if (item.quantity > 1) {
                item.quantity--;
                saveToSessionStorage('cart', cart);
                renderCartItems();
            } else {
                cart = cart.filter(i => i.id != productId);
                saveToSessionStorage('cart', cart);
                renderCartItems();
            }
        }
    });

    favoritesList.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button');
        if (!targetBtn || !targetBtn.classList.contains('remove-from-favorites-btn')) return;
        
        const productId = targetBtn.dataset.id;
        let favorites = getFromSessionStorage('favorites');
        favorites = favorites.filter(fav => fav.id != productId);
        saveToSessionStorage('favorites', favorites);
        renderFavorites();
        renderProducts(); // Atualiza a tela principal para desmarcar o coração
    });


    // Funções para bloquear/desbloquear scroll da página
    // Suporta modais aninhados (ex.: produto -> comparar) sem perder posição.
    let modalScrollLockDepth = 0;
    let modalScrollY = 0;

    const lockBodyScroll = () => {
        if (modalScrollLockDepth === 0) {
            modalScrollY = window.scrollY || window.pageYOffset || 0;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${modalScrollY}px`;
            document.body.style.width = '100%';
            document.body.classList.add('modal-open');
        }
        modalScrollLockDepth += 1;
    };

    const unlockBodyScroll = () => {
        if (modalScrollLockDepth <= 0) {
            modalScrollLockDepth = 0;
            return;
        }

        modalScrollLockDepth -= 1;
        if (modalScrollLockDepth > 0) {
            return;
        }

        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.classList.remove('modal-open');
        window.scrollTo(0, Math.max(0, parseInt(modalScrollY || 0, 10)));
    };

    // Abrir modais
    // Helpers para abrir/fechar com animação
    const openModal = (modal) => {
        if (!modal) return;
        
        // Bloquear scroll da página
        lockBodyScroll();
        
        modal.classList.remove('closing');
        modal.classList.add('show');
        // ensure display flex for modal container
        modal.style.display = 'flex';
        // allow CSS to animate
        setTimeout(() => modal.classList.add('visible'), 10);

        // Compare modal: always open from top and show highlighted cheapest card first
        if (modal.id === 'compare-modal') {
            const resetCompareScroll = () => {
                const content = modal.querySelector('.modal-content');
                const list = modal.querySelector('#compare-list, .compare-list');
                try {
                    if (content) content.scrollTop = 0;
                    if (list) list.scrollTop = 0;
                    const highlight = list ? list.querySelector('.compare-highlight-card') : null;
                    if (highlight && typeof highlight.scrollIntoView === 'function') {
                        highlight.scrollIntoView({ block: 'start', inline: 'nearest' });
                    }
                } catch (_) { /* noop */ }
            };
            requestAnimationFrame(resetCompareScroll);
            setTimeout(resetCompareScroll, 70);
            setTimeout(resetCompareScroll, 180);
        }
    };

    const closeModal = (modal) => {
        if (!modal) return;
        if (modal.id === 'compare-modal') {
            try { __closeCompareImageZoom(); } catch (_) { /* noop */ }
        }
        
        modal.classList.remove('visible');
        modal.classList.add('closing');
        
        // aguarda animação antes de esconder e desbloquear scroll
        setTimeout(() => {
            modal.classList.remove('show', 'closing');
            modal.style.display = 'none';
            
            // Desbloquear scroll da página
            unlockBodyScroll();
        }, 240);
    };

    const ensureUpdateInfoModal = () => {
        let modal = document.getElementById('app-update-modal');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'app-update-modal';
        modal.className = 'modal update-info-modal';
        modal.style.zIndex = '320000';

        const notesHtml = APP_RELEASE_NOTES
            .map(note => `<li>${pjEsc(note)}</li>`)
            .join('');

        modal.innerHTML = `
            <div class="modal-content update-info-content" role="dialog" aria-modal="true" aria-labelledby="update-info-title">
                <button type="button" class="update-info-close" id="close-update-info" aria-label="Fechar">&times;</button>
                <h2 id="update-info-title"><i class="fas fa-rocket"></i> ${pjEsc(APP_RELEASE_TITLE)}</h2>
                <p class="update-info-version">Versão: <strong>${pjEsc(APP_RELEASE_VERSION)}</strong></p>
                <p class="update-info-subtitle">O que melhorou nesta versão:</p>
                <ul class="update-info-list">${notesHtml}</ul>
                <div class="update-info-actions">
                    <button type="button" class="checkout-btn" id="update-info-ok-btn">Entendi</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const markAsSeenAndClose = () => {
            try { localStorage.setItem(APP_RELEASE_SEEN_KEY, APP_RELEASE_VERSION); } catch (_) { /* noop */ }
            closeModal(modal);
        };

        const closeBtn = modal.querySelector('#close-update-info');
        const okBtn = modal.querySelector('#update-info-ok-btn');
        if (closeBtn) closeBtn.addEventListener('click', markAsSeenAndClose);
        if (okBtn) okBtn.addEventListener('click', markAsSeenAndClose);

        return modal;
    };

    const showUpdateInfoIfNeeded = () => {
        let lastSeen = '';
        try { lastSeen = localStorage.getItem(APP_RELEASE_SEEN_KEY) || ''; } catch (_) { /* noop */ }
        if (lastSeen === APP_RELEASE_VERSION) return;
        const modal = ensureUpdateInfoModal();
        openModal(modal);
    };

    cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(cartModal);
        renderCartItems();
    });
    
    favoritesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(favoritesModal);
        renderFavorites();
    });

    // Fechar modais com animação
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.id === 'pj-close-product-modal') {
                pjCloseModal();
                return;
            }
            if (btn.id === 'close-compare-btn') {
                // O compare usa fluxo customizado de "voltar"; não aplicar fechamento genérico.
                return;
            }
            const modal = btn.closest('.modal');
            closeModal(modal);
        });
    });

    closeCartBtn.addEventListener('click', () => {
        closeModal(cartModal);
    });

    // Exibe novidades automaticamente quando a versão publicada muda.
    setTimeout(showUpdateInfoIfNeeded, 600);

    // Fechar modais clicando fora (backdrop) - genérico para qualquer modal
    window.addEventListener('click', (e) => {
        try {
            if (isCompareImageZoomOpen()) {
                return;
            }
            if (e.target && e.target.classList && e.target.classList.contains('modal')) {
                if (e.target.id === 'pj-product-modal') {
                    pjCloseModal();
                    return;
                }
                closeModal(e.target);
            }
        } catch (err) {
            // segurança contra ambientes inesperados
            console.error('Erro ao avaliar clique no backdrop do modal:', err);
        }
    });

    // Lógica para os botões de scroll da lista de produtos
    if (scrollContainer && prevBtn && nextBtn) {
        const scrollAmount = 300; 

        prevBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        scrollContainer.addEventListener('scroll', manageScrollButtons);
        // Adiciona um listener para o resize da janela, caso o utilizador mude o tamanho
        window.addEventListener('resize', manageScrollButtons);
    }

    if (openAllProductsPageBtn) {
        openAllProductsPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAllProductsPage();
        });
    }

    if (allProductsBackBtn) {
        allProductsBackBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllProductsPage();
        });
    }

    if (allProductsBackFloatingBtn) {
        allProductsBackFloatingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllProductsPage();
        });
    }


    // Listener para produtos carregados do Firebase
    window.addEventListener('productsLoaded', (event) => {
        console.log('🔥 Evento productsLoaded recebido:', event.detail);
        updateFilterOptions();
        renderProducts();
        renderFavorites();
        renderSearchHistory();
        renderRecentProducts();
    });

    // Inicialização
    updateFilterOptions();
    renderProducts();
    renderFavorites();
    renderSearchHistory();
    renderRecentProducts();
    // initialize last searched badge if present
    try {
        const saved = getFromSessionStorage('lastSearched');
        if (saved && typeof setLastSearched === 'function') setLastSearched(saved);
    } catch (initErr) { /* ignore */ }

    // Handler duplicado (segunda seção) substituído: abrir scanner sem focar input
    const barcodeBtn = document.getElementById('barcode-search-btn');
    if (barcodeBtn) {
        barcodeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                if (document.activeElement && document.activeElement !== document.body) {
                    document.activeElement.blur();
                }
            } catch(_) {}
            if (typeof window.openBarcodeScanner === 'function') {
                window.openBarcodeScanner();
            }
        });
    }

    // Scanner de código de barras (usa BarcodeDetector quando disponível)
    const scannerModal = document.getElementById('scanner-modal');
    const barcodeScannerEl = document.getElementById('barcode-scanner');
    const scannerMessage = document.getElementById('scanner-message');
    const stopScannerBtn = document.getElementById('stop-scanner');
    const cameraSelect = document.getElementById('camera-select');

    let scannerStream = null;
    let scannerInterval = null;
    let barcodeDetector = null;
    let zxingReader = null;
    let currentDeviceId = null;
    let html5QrCode = null;
    let html5QrCodeRunning = false;

    // Beep curto ao ler um código
    const playBeep = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(1000, ctx.currentTime);
            g.gain.setValueAtTime(0.001, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
            o.connect(g); g.connect(ctx.destination); o.start();
            // dura ~120ms
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
            o.stop(ctx.currentTime + 0.15);
        } catch(_) {}
    };

    // Toast helper para feedback rápido
    const getToastContainer = () => {
        let c = document.getElementById('toast-container');
        if (!c) {
            c = document.createElement('div');
            c.id = 'toast-container';
            c.className = 'toast-container';
            c.setAttribute('role', 'status');
            c.setAttribute('aria-live', 'polite');
            document.body.appendChild(c);
        }
        return c;
    };

    const showToast = (message, opts = {}) => {
        const { duration = 2600, type = 'info' } = opts;
        const container = getToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        // animação de entrada
        requestAnimationFrame(() => toast.classList.add('show'));
        // saída e remoção
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, duration);
    };

    // Centraliza o preenchimento e a pesquisa ao escanear um código
    const applyScannedBarcode = (code) => {
        if (!code) return;
        playBeep();
        // Preenche o campo "Pesquisar por código de barras" se existir
        if (barcodeSearchBar) {
            barcodeSearchBar.value = code;
            // Dispara o evento de input para acionar a filtragem e UI relacionadas
            try { barcodeSearchBar.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
            // Opcional: atualiza a badge de última busca
            try { if (typeof setLastSearched === 'function') setLastSearched(code); } catch (_) {}
            // Tenta abrir automaticamente a comparação do produto lido
            try {
                const products = getFromLocalStorage('products');
                const prod = products.find(p => String(p.barcode) === String(code));
                if (prod && typeof openCompareModal === 'function') {
                    // pequeno atraso para UI respirar e garantir parada do scanner
                    setTimeout(() => openCompareModal(prod.name), 150);
                    try { showToast(`Código lido: ${code}. Abrindo comparação…`, { type: 'success' }); } catch (_) {}
                } else {
                    try { showToast(`Código lido: ${String(code)} – produto não encontrado`, { type: 'info' }); } catch (_) {}
                }
            } catch(_) {}
        } else if (productSearchBar) {
            // Fallback: preenche o campo de nome
            productSearchBar.value = code;
            if (typeof filterProducts === 'function') filterProducts();
            try { showToast(`Código lido: ${String(code).slice(0, 18)} – resultados filtrados`, { type: 'success' }); } catch (_) {}
        }
    };

    const startScanner = async () => {
        if (!scannerModal) return;
        openModal(scannerModal);
        try {
            // Preferir html5-qrcode (robusto em Android/iOS)
            if (window.Html5Qrcode && barcodeScannerEl) {
                // criar/reciclar instância
                if (!html5QrCode) html5QrCode = new Html5Qrcode(barcodeScannerEl.id, { verbose: false });
                const cameras = await Html5Qrcode.getCameras();
                let camId = null;
                if (cameras && cameras.length) {
                    // popular select personalizado (opcional)
                    if (cameraSelect) {
                        cameraSelect.innerHTML = '';
                        cameras.forEach((c, idx) => {
                            const opt = document.createElement('option');
                            opt.value = c.id; opt.textContent = c.label || `Câmera ${idx + 1}`; cameraSelect.appendChild(opt);
                        });
                        cameraSelect.style.display = 'inline-block';
                    }
                    // escolher traseira se existir
                    const back = cameras.find(c => /back|traseira|rear|environment/i.test(c.label));
                    camId = currentDeviceId || (back ? back.id : cameras[cameras.length - 1].id);
                    currentDeviceId = camId;
                }

                const config = { fps: 12, disableFlip: false, qrbox: (vw,vh)=>{ const s=Math.min(280, Math.floor(Math.min(vw,vh)*0.8)); return { width: s, height: s }; } };
                const formatsToSupport = [
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E
                ];
                config.formatsToSupport = formatsToSupport;

                await html5QrCode.start(
                    camId ? { deviceId: { exact: camId } } : { facingMode: 'environment' },
                    config,
                    (decodedText) => {
                        if (!decodedText) return;
                        if (html5QrCodeRunning) { // evitar múltiplos callbacks
                            html5QrCodeRunning = false;
                            applyScannedBarcode(decodedText);
                            stopScanner();
                        }
                    },
                    (errMsg) => {
                        // erros de leitura são esperados; reduzir ruído
                        // console.debug('scan error', errMsg);
                    }
                );
                html5QrCodeRunning = true;
                scannerMessage.textContent = 'Aponte a câmera para o código de barras.';
                return;
            }

            // Fallback: API nativa ou ZXing se html5-qrcode não estiver disponível
            if ('BarcodeDetector' in window) {
                const formats = await BarcodeDetector.getSupportedFormats();
                barcodeDetector = new BarcodeDetector({ formats });
                // iniciar câmera simples

                const config = { fps: 12, disableFlip: false, qrbox: (vw,vh)=>{ const s=Math.min(280, Math.floor(Math.min(vw,vh)*0.8)); return { width: s, height: s }; } };
                const formatsToSupport = [
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E
                ];
                config.formatsToSupport = formatsToSupport;

                await html5QrCode.start(
                    camId ? { deviceId: { exact: camId } } : { facingMode: 'environment' },
                    config,
                    (decodedText) => {
                        if (!decodedText) return;
                        if (html5QrCodeRunning) { // evitar múltiplos callbacks
                            html5QrCodeRunning = false;
                            applyScannedBarcode(decodedText);
                            stopScanner();
                        }
                    },
                    (errMsg) => {
                        // erros de leitura são esperados; reduzir ruído
                        // console.debug('scan error', errMsg);
                    }
                );
                html5QrCodeRunning = true;
                scannerMessage.textContent = 'Aponte a câmera para o código de barras.';
                return;
            }

            // Fallback: API nativa ou ZXing se html5-qrcode não estiver disponível
            if ('BarcodeDetector' in window) {
                const formats = await BarcodeDetector.getSupportedFormats();
                barcodeDetector = new BarcodeDetector({ formats });
                // iniciar câmera simples
                const constraints = currentDeviceId ? { video: { deviceId: { exact: currentDeviceId } } } : { video: { facingMode: 'environment' } };
                scannerStream = await navigator.mediaDevices.getUserMedia({ ...constraints, audio: false });
                const videoEl = document.createElement('video');
                videoEl.playsInline = true; videoEl.muted = true; videoEl.autoplay = true; videoEl.srcObject = scannerStream; videoEl.play();
                // loop de detecção
                scannerInterval = setInterval(async () => {
                    try {
                        const barcodes = await barcodeDetector.detect(videoEl);
                        if (barcodes && barcodes.length) {
                            const code = barcodes[0].rawValue;
                            if (code) { applyScannedBarcode(code); stopScanner(); }
                        }
                    } catch (err) { /* ignore */ }
                }, 700);
            } else if (window.ZXing && window.ZXing.BrowserMultiFormatReader) {
                try {
                    scannerMessage.textContent = 'Usando leitor fallback (ZXing)...';
                    zxingReader = new ZXing.BrowserMultiFormatReader();
                    if (typeof zxingReader.decodeFromVideoDevice === 'function') {
                        zxingReader.decodeFromVideoDevice(null, barcodeScannerEl.id, (result, err) => {
                            if (result) {
                                const code = result.text || (result.getText && result.getText());
                                if (code) { applyScannedBarcode(code); stopScanner(); }
                            }
                        });
                    }
                } catch (zxErr) {
                    console.error('Erro no fallback ZXing:', zxErr);
                    scannerMessage.textContent = 'Erro ao inicializar leitor fallback.';
                }
            } else {
                scannerMessage.textContent = 'Leitor de código não disponível neste navegador. Por favor insira manualmente.';
            }
        } catch (err) {
            console.error('Erro ao acessar câmera:', err);
            scannerMessage.textContent = 'Não foi possível acessar a câmera.';
        }
    };

    const stopScanner = () => {
        if (scannerInterval) { clearInterval(scannerInterval); scannerInterval = null; }
        // parar html5-qrcode
        if (html5QrCode && html5QrCodeRunning) {
            try { html5QrCode.stop().then(() => html5QrCode.clear()); } catch(_) {}
        }
        html5QrCodeRunning = false;
        // parar qualquer stream manual
        try {
            if (scannerStream && typeof scannerStream.getTracks === 'function') {
                scannerStream.getTracks().forEach(t => t.stop());
            }
        } catch(_) {}
        if (scannerStream) { scannerStream = null; }
        // Se estiver usando ZXing, pare o leitor contínuo
        try {
            if (zxingReader) {
                if (typeof zxingReader.reset === 'function') {
                    zxingReader.reset();
                }
                zxingReader = null;
            }
        } catch (zxStopErr) {
            console.error('Erro ao parar ZXing reader:', zxStopErr);
        }
        // opcional: restaurar seleção de dispositivos (manter atual)
        if (scannerModal) closeModal(scannerModal);
    };

    // Enumerar câmeras disponíveis e popular o select
    const populateCameraList = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
        try {
            let videoDevices = [];
            // Se html5-qrcode estiver presente, use sua API (fornece labels melhores em iOS)
            if (window.Html5Qrcode && typeof Html5Qrcode.getCameras === 'function') {
                const cams = await Html5Qrcode.getCameras();
                videoDevices = (cams || []).map(c => ({ deviceId: c.id, label: c.label, kind: 'videoinput' }));
            } else {
                const devices = await navigator.mediaDevices.enumerateDevices();
                videoDevices = devices.filter(d => d.kind === 'videoinput');
            }
            if (!cameraSelect) return;
            cameraSelect.innerHTML = '';
            if (videoDevices.length === 0) {
                cameraSelect.style.display = 'none';
                return;
            }
            videoDevices.forEach((dev, idx) => {
                const opt = document.createElement('option');
                opt.value = dev.deviceId;
                opt.textContent = dev.label || `Câmera ${idx + 1}`;
                cameraSelect.appendChild(opt);
            });
            cameraSelect.style.display = 'inline-block';
            // set default to last (frequent rear camera)
            const defaultIdx = videoDevices.length - 1;
            cameraSelect.selectedIndex = defaultIdx;
            currentDeviceId = cameraSelect.value;
        } catch (err) {
            console.error('Erro ao listar câmeras:', err);
        }
    };

    if (cameraSelect) {
        cameraSelect.addEventListener('change', (e) => {
            currentDeviceId = e.target.value;
            // Se o scanner estiver aberto, reinicia com a nova câmera
            if (scannerModal && scannerModal.classList.contains('show')) {
                stopScanner();
                setTimeout(() => startScanner(), 300);
            }
        });
    }

    // abrir scanner ao clicar na imagem/banner
    const barcodeImg = document.querySelector('.barcode-img');
    if (barcodeImg) {
        barcodeImg.addEventListener('click', (e) => { e.preventDefault(); startScanner(); });
    }
    // abrir scanner ao clicar no nome do CTA
    const barcodeSearchBtn2 = document.getElementById('barcode-search-btn');
    if (barcodeSearchBtn2) {
        barcodeSearchBtn2.addEventListener('click', (e) => { e.preventDefault(); startScanner(); });
    }

    if (stopScannerBtn) stopScannerBtn.addEventListener('click', stopScanner);
    // Popula lista de câmeras ao carregar a página
    populateCameraList();

    // Floating barcode button (centralizado aqui)
    const floatingBarcodeBtn = document.getElementById('floating-barcode-btn');
    if (floatingBarcodeBtn) {
        floatingBarcodeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            populateCameraList().finally(() => startScanner());
        });
    }

    // Event listener global para impedir scroll APENAS quando realmente há um modal visível
    const preventScroll = (e) => {
        // Exigir classe e um modal .show presente (safety contra classe presa por engano)
        const hasLockClass = document.body.classList.contains('modal-open');
        const anyModalOpen = !!document.querySelector('.modal.show');
        if (!(hasLockClass && anyModalOpen)) return; // não bloquear

        // Bloquear scroll da página de fundo; permitir scroll dentro do modal
        const openModalEl = document.querySelector('.modal.show .modal-content');
        const isInsideModal = openModalEl && openModalEl.contains(e.target);
        if (!isInsideModal) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    // Adicionar listeners para diferentes tipos de scroll
    document.addEventListener('wheel', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('keydown', (e) => {
        const hasLockClass = document.body.classList.contains('modal-open');
        const anyModalOpen = !!document.querySelector('.modal.show');
        if (!(hasLockClass && anyModalOpen)) return;
        // Impedir teclas de navegação (setas, page up/down, home, end)
        if ([32, 33, 34, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
            return false;
        }
    });

    // Tornar as funções disponíveis globalmente
    window.filterProducts = filterProducts;
    window.filterProductsByBarcode = filterProductsByBarcode;

    // Chamar initializeAppData após configurar tudo
    try {
        initializeAppData();
    } catch (e) {
        console.error('Erro ao inicializar dados:', e);
    }

    // Listener para quando os produtos forem carregados do Firebase
    window.addEventListener('productsLoaded', (event) => {
        console.log('🔥 Evento productsLoaded recebido:', event.detail);
        if (typeof window.renderProducts === 'function') {
            window.renderProducts();
            console.log('✅ Produtos do Firebase renderizados após evento');
            // Atualiza filtros após carregamento
            if (typeof updateFilterOptions === 'function') {
                updateFilterOptions();
            }
        }
    });

}); // <-- Fecha o primeiro e único listener de DOMContentLoaded corretamente

// Funcao global para abrir detalhes (mantida fora do listener para acesso geral)
function showProductDetail(product) {
    window.currentDetailProduct = product;
    const modal = document.getElementById('product-detail-modal');
    if (!modal) return;
    const imgEl = document.getElementById('detail-image');
    const nameEl = document.getElementById('detail-name');
    if (imgEl) {
        imgEl.src = product.imageUrl || product.image || 'images/placeholder.png';
        imgEl.setAttribute('data-product-id', product.id);
    }
    if (nameEl) nameEl.textContent = product.name;
}

// Fallback: apos window load, garantir render se produtos ja estiverem no localStorage
window.addEventListener('load', () => {
    try {
        const stored = JSON.parse(localStorage.getItem('products') || '[]');
        console.log(`Fallback load listener: ${stored.length} produtos no localStorage`);
        if (stored.length > 0 && typeof window.renderProducts === 'function') {
            window.renderProducts(stored);
            if (typeof updateFilterOptions === 'function') updateFilterOptions();
        }
    } catch (e) {
        console.warn('Falha no fallback de renderizacao:', e);
    }
});

// Listener fora do DOMContentLoaded para nao perder evento precoce
window.addEventListener('productsLoaded', (event) => {
    try {
        if (typeof window.renderProducts === 'function') {
            window.renderProducts(event.detail.products);
            if (typeof updateFilterOptions === 'function') updateFilterOptions();
            if (typeof renderRecentProducts === 'function') renderRecentProducts();
        }
    } catch (e) {
        console.warn('Falha ao processar productsLoaded externo:', e);
    }
});
