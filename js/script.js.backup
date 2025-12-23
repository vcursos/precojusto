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
        
        productCard.innerHTML = `
            <img src="${product.imageUrl || DEFAULT_IMAGE_URL}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${formatPrice(product.price)}</p>
                <p class="product-details concise compact">
                    <span class="meta-item"><strong>Mercado:</strong> ${product.market}</span>
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
        return productCard;
    };

    // Product detail modal logic
    const productDetailModal = document.getElementById('product-detail-modal');
    const closeProductDetailBtn = document.getElementById('close-product-detail');
    const detailImage = document.getElementById('detail-image');
    const detailName = document.getElementById('detail-name');
    const detailPrice = document.getElementById('detail-price');
    const detailMeta = document.getElementById('detail-meta');
    const detailDescription = document.getElementById('detail-description');
    const detailFavBtn = document.getElementById('detail-fav');
    const detailCartBtn = document.getElementById('detail-cart');
    const detailCompareBtn = document.getElementById('detail-compare');

    const openProductDetail = (productId) => {
        const products = getFromLocalStorage('products');
        const p = products.find(x => String(x.id) === String(productId));
        if (!p) return;
        detailImage.src = p.imageUrl || DEFAULT_IMAGE_URL;
        detailName.textContent = p.name;
        detailPrice.textContent = formatPrice(p.price);
        detailMeta.innerHTML = `
            ${p.barcode ? `<div><strong>Código de Barras:</strong> <code style="background:#f0f8ff;padding:2px 6px;border-radius:4px;font-family:monospace;">${p.barcode}</code></div>` : ''}
            <div><strong>Mercado:</strong> ${p.market || '—'}</div>
            <div><strong>Marca:</strong> ${p.brand || '—'}</div>
            <div><strong>Categoria:</strong> ${p.category || '—'}</div>
            <div><strong>Unidade:</strong> ${(p.quantity || '1')} ${p.unit || 'unidade'}</div>
            ${p.zone ? `<div><strong>Zona:</strong> ${p.zone}</div>` : ''}
            ${p.parish ? `<div><strong>Freguesia:</strong> ${p.parish}</div>` : ''}
        `;
        detailDescription.textContent = p.description || '';
        
        // Mostrar/ocultar seção de descrição
        const descriptionContainer = document.getElementById('detail-description-container');
        if (p.description && p.description.trim()) {
            descriptionContainer.style.display = 'block';
        } else {
            descriptionContainer.style.display = 'none';
        }

        // set fav state on detail
        const favs = getFromSessionStorage('favorites');
        if (favs.some(f => String(f.id) === String(p.id))) detailFavBtn.classList.add('active'); else detailFavBtn.classList.remove('active');

        // bind actions
        detailFavBtn.onclick = () => {
            let favorites = getFromSessionStorage('favorites');
            const exists = favorites.some(f => String(f.id) === String(p.id));
            if (exists) favorites = favorites.filter(f => String(f.id) !== String(p.id)); else favorites.push(p);
            saveToSessionStorage('favorites', favorites);
            renderFavorites();
            renderProducts();
            detailFavBtn.classList.toggle('active');
            if (!exists) alert(`${p.name} adicionado aos favoritos!`);
        };

        detailCartBtn.onclick = () => {
            const cart = getFromSessionStorage('cart');
            const existing = cart.find(i => String(i.id) === String(p.id));
            if (existing) existing.quantity = (existing.quantity || 1) + 1; else { const copy = Object.assign({}, p); copy.quantity = 1; cart.push(copy); }
            saveToSessionStorage('cart', cart);
            renderCartItems();
            alert(`${p.name} adicionado ao carrinho!`);
        };

    detailCompareBtn.onclick = () => { closeModal(productDetailModal); openCompareModal(p.name); };

        openModal(productDetailModal);
    };

    if (closeProductDetailBtn) closeProductDetailBtn.addEventListener('click', () => closeModal(productDetailModal));

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
            <img src="${product.imageUrl || DEFAULT_IMAGE_URL}" alt="${product.name}" class="modal-item-image">
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
        // Garante que o estado dos botões é verificado após a renderização
        setTimeout(manageScrollButtons, 100);
    };
    
    // Tornar renderProducts disponível globalmente para firebase-loader.js
    window.renderProducts = renderProducts;

    // Compare modal helpers
    const compareModal = document.getElementById('compare-modal');
    const compareList = document.getElementById('compare-list');
    const compareEmpty = document.getElementById('compare-empty');
    const compareTitle = document.getElementById('compare-modal-title');
    const closeCompareBtn = document.getElementById('close-compare-btn');

    const normalizeName = (name) => name ? name.toString().toLowerCase().replace(/\s+/g, ' ').trim() : '';

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

    const openCompareModal = (productName) => {
        const products = getFromLocalStorage('products');
        const normalized = normalizeName(productName);
        const isGenericArrozSearch = normalized === 'arroz';

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

        // helper: consider two names similar if they share the same first 2+ words or high overlap
        const areNamesSimilar = (n1, n2) => {
            if (!n1 || !n2) return false;
            const a = normalizeName(n1).split(' ');
            const b = normalizeName(n2).split(' ');
            // require at least 2 words to compare usefully
            const minWords = 2;
            const common = a.filter((w, i) => b[i] === w).length;
            if (common >= minWords) return true;
            // fallback: compute overlap ratio
            const setA = new Set(a);
            const setB = new Set(b);
            const intersection = [...setA].filter(x => setB.has(x)).length;
            const union = new Set([...setA, ...setB]).size;
            if (union === 0) return false;
            const ratio = intersection / union;
            return ratio >= 0.5; // 50% overlap considered similar
        };

        // expand matches to include names that are similar by words (helps when only brand differs)
        const extra = products.filter(p => !matches.includes(p) && areNamesSimilar(p.name, productName));
        if (extra.length) {
            matches.push(...extra);
        }

        // fallback: if no matches by core, try exact name or substring match
        if (matches.length === 0) {
            matches = products.filter(p => normalizeName(p.name) === normalized);
            if (matches.length === 0) {
                matches = products.filter(p => normalizeName(p.name).includes(normalized));
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
        if (!matches || matches.length === 0) {
            compareEmpty.style.display = 'block';
            compareTitle.textContent = `Comparar: ${productName}`;
            openModal(compareModal);
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
        highlightCard.innerHTML = `
            <div class="highlight-left">
                <img src="${cheapestGlobal.imageUrl || DEFAULT_IMAGE_URL}" alt="${cheapestGlobal.name}" class="highlight-image" loading="lazy">
            </div>
            <div class="highlight-main">
                <h3 class="highlight-name">${cheapestGlobal.name}</h3>
                <div class="highlight-meta">
                    <span class="highlight-market">${cheapestGlobal.market || ''}</span>
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
                <div class="cli-market-col">${p.market || ''}</div>
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

        // Se viewport > 720, usa layout desktop. Para mobile, usaremos uma versão linear simplificada.
        if (typeof window !== 'undefined' && window.innerWidth > 720) {
            compareList.appendChild(desktopLayout);
            openModal(compareModal);
            return; // interrompe antes do layout antigo
        }

        // ===== Novo fluxo para MOBILE: destaque + lista linear =====
        if (typeof window !== 'undefined' && window.innerWidth <= 720) {
            const mobileLayout = document.createElement('div');
            mobileLayout.className = 'compare-mobile-redesign';

            // destaque (reutiliza o mesmo HTML de destaque)
            const mobileHighlight = document.createElement('div');
            mobileHighlight.className = 'compare-highlight-card';
            mobileHighlight.innerHTML = `
                <div class="highlight-left">
                    <img src="${cheapestGlobal.imageUrl || DEFAULT_IMAGE_URL}" alt="${cheapestGlobal.name}" class="highlight-image" loading="lazy">
                </div>
                <div class="highlight-main">
                    <h3 class="highlight-name">${cheapestGlobal.name}</h3>
                    <div class="highlight-meta">
                        <span class="highlight-market">${cheapestGlobal.market || ''}</span>
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
            mobileLayout.appendChild(mobileHighlight);

            // lista linear dos demais
            const mobileList = document.createElement('div');
            mobileList.className = 'compare-linear-list';
            const base = parseFloat(cheapestGlobal.price);
            const diffPct = (price) => {
                const current = parseFloat(price);
                if (!isFinite(base) || base <= 0) return '—';
                const pct = ((current - base) / base) * 100;
                if (pct === 0) return 'Igual';
                const str = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
                return str;
            };
            others.forEach(p => {
                const node = document.createElement('div');
                node.className = 'compare-linear-item';
                node.dataset.productId = p.id;
                node.innerHTML = `
                    <div class="cli-image-col">
                        <img src="${p.imageUrl || DEFAULT_IMAGE_URL}" alt="${p.name}" class="cli-image" loading="lazy">
                    </div>
                    <div class="cli-name-col" title="${p.name}">${p.name}</div>
                    <div class="cli-market-col">${p.market || ''}</div>
                    <div class="cli-price-col">${formatPrice(p.price)}</div>
                    <div class="cli-diff-col">${diffPct(p.price)}</div>
                    <div class="cli-actions-col">
                        <button class="fav-btn ${isFav(p.id) ? 'fav-active' : ''}" aria-pressed="${isFav(p.id)}" data-id="${p.id}" title="Favoritar"><i class="fas fa-heart"></i></button>
                        <button class="cart-btn ${inCart(p.id) ? 'adicionado in-cart' : ''}" aria-pressed="${inCart(p.id)}" data-id="${p.id}" title="Adicionar ao carrinho"><i class="fas fa-shopping-cart"></i></button>
                    </div>
                `;
                mobileList.appendChild(node);
            });
            mobileLayout.appendChild(mobileList);

            openComparePage(productName, mobileLayout);
            return;
        }

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
        openModal(compareModal);

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
                <button id="compare-page-back" class="compare-page-back">← Voltar</button>
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

        // push history state so native back works
        try { history.pushState({ comparePage: true, product: productName }, '', '#compare'); } catch (e) { /* ignore */ }

        const onPop = (e) => {
            // if state no longer indicates compare page, close it
            if (!e.state || !e.state.comparePage) closeComparePage();
        };
        window.addEventListener('popstate', onPop);
        // store listener so we can remove later
        comparePage._onPop = onPop;

        // Bind delegated actions for favorites/cart inside the mobile compare page
        if (!comparePage._onFavCart) {
            comparePage._onFavCart = (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;
                const id = btn.dataset && btn.dataset.id;
                if (!id) return;
                // Favoritar
                if (btn.classList.contains('fav-btn')) {
                    let favorites = getFromSessionStorage('favorites');
                    const isFav = favorites.some(f => String(f.id) === String(id));
                    if (isFav) {
                        favorites = favorites.filter(f => String(f.id) !== String(id));
                    } else {
                        const product = getFromLocalStorage('products').find(p => String(p.id) === String(id));
                        if (product) favorites.push(product);
                    }
                    saveToSessionStorage('favorites', favorites);
                    renderFavorites();
                    renderProducts();
                    // toggle visual state
                    const nowFav = !isFav;
                    btn.classList.toggle('fav-active', nowFav);
                    btn.setAttribute('aria-pressed', String(nowFav));
                    const notice = document.getElementById('compare-action-notice');
                    if (notice) {
                        notice.textContent = nowFav ? 'Adicionado aos favoritos' : 'Removido dos favoritos';
                        notice.className = 'compare-action-notice ' + (nowFav ? 'success' : 'info');
                        notice.style.display = 'block';
                        // auto-hide after 2.5s
                        clearTimeout(notice._t);
                        notice._t = setTimeout(()=> notice.style.display='none', 2500);
                    }
                    try { showToast(nowFav ? 'Adicionado aos favoritos' : 'Removido dos favoritos', { type: 'info' }); } catch(_) {}
                }
                // Carrinho
                if (btn.classList.contains('cart-btn')) {
                    const cart = getFromSessionStorage('cart');
                    const product = getFromLocalStorage('products').find(p => String(p.id) === String(id));
                    if (product) {
                        const existing = cart.find(i => String(i.id) === String(id));
                        if (existing) existing.quantity = (existing.quantity || 1) + 1;
                        else { const copy = Object.assign({}, product); copy.quantity = 1; cart.push(copy); }
                        saveToSessionStorage('cart', cart);
                        renderCartItems();
                        btn.classList.add('adicionado','in-cart');
                        btn.setAttribute('aria-pressed','true');
                        const notice = document.getElementById('compare-action-notice');
                        if (notice) {
                            notice.textContent = `${product.name} adicionado ao carrinho`;
                            notice.className = 'compare-action-notice success';
                            notice.style.display = 'block';
                            clearTimeout(notice._t);
                            notice._t = setTimeout(()=> notice.style.display='none', 2500);
                        }
                        try { showToast(`${product.name} adicionado ao carrinho`, { type: 'success' }); } catch(_) {}
                    }
                }
            };
            comparePage.addEventListener('click', comparePage._onFavCart);
        }

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
        if (backBtn) backBtn.onclick = () => { history.back(); };

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
        comparePage.innerHTML = '';
        document.documentElement.style.overflow = '';
        // remove the hash without navigating if it points to compare
        try {
            if (location.hash === '#compare') history.replaceState({}, '', location.pathname + location.search);
        } catch (e) { /* ignore */ }
    };

    // show product details inside the compare modal (replaces compare content)
    const showCompareItemDetail = (productId) => {
        const products = getFromLocalStorage('products');
        const p = products.find(x => String(x.id) === String(productId));
        if (!p) return;
        const esc = (s) => (s || '').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

        // update title and render a compact detail view inside the compare list container
        compareTitle.textContent = `Detalhes: ${p.name}`;
        compareList.innerHTML = `
            <div class="compare-detail">
                <button id="compare-detail-back" class="compare-detail-back">← Voltar</button>
                <div class="compare-detail-grid">
                    <div class="detail-image-col">
                        <img src="${esc(p.imageUrl || DEFAULT_IMAGE_URL)}" alt="${esc(p.name)}" class="detail-image">
                    </div>
                    <div class="detail-info-col">
                        <h3 class="detail-name">${esc(p.name)}</h3>
                        <div class="detail-price">${formatPrice(p.price)}</div>
                        <div class="detail-meta">
                            <div><strong>Mercado:</strong> ${esc(p.market || '—')}</div>
                            <div><strong>Marca:</strong> ${esc(p.brand || '—')}</div>
                            <div><strong>Categoria:</strong> ${esc(p.category || '—')}</div>
                            <div><strong>Unidade:</strong> ${esc(p.quantity||'')} ${esc(p.unit||'')}</div>
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

        // back button restores the comparison view by re-opening it with the original product name
        const backBtn = document.getElementById('compare-detail-back');
        if (backBtn) backBtn.addEventListener('click', () => {
            const original = (compareModal && compareModal.dataset.compareProduct) ? compareModal.dataset.compareProduct : p.name;
            openCompareModal(original);
        });
    };

    if (closeCompareBtn) closeCompareBtn.addEventListener('click', () => closeModal(compareModal));

    // Delegated events inside compare modal for fav/cart
    compareList.addEventListener('click', (e) => {
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

    const renderRecentProducts = () => {
        const products = getFromLocalStorage('products');
        const recentProducts = products.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 5);

        if (!recentProductsList) return; // Proteção caso o elemento não exista
        
        recentProductsList.innerHTML = '';
        if (recentProducts.length === 0) {
            if (noRecentProductsMessage) noRecentProductsMessage.style.display = 'block';
        } else {
            if (noRecentProductsMessage) noRecentProductsMessage.style.display = 'none';
            recentProducts.forEach(product => {
                const productCard = createProductCard(product);
                recentProductsList.appendChild(productCard);
            });
        }
    };

    // Lógica para Favoritos
    const renderFavorites = () => {
        const favorites = getFromSessionStorage('favorites');
        favoritesList.innerHTML = '';
        if (favorites.length === 0) {
            noFavoritesMessage.style.display = 'block';
        } else {
            noFavoritesMessage.style.display = 'none';
            favorites.forEach(product => {
                const listItem = createModalListItem(product, false);
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

        if (!cart || cart.length === 0) {
            emptyCartMessage.style.display = 'block';
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

        let grandTotal = 0;

        Object.keys(groups).forEach(market => {
            const items = groups[market];
            // Cabeçalho do mercado
            const marketHeader = document.createElement('div');
            marketHeader.className = 'cart-market-header';
            marketHeader.innerHTML = `<h4 class="market-name">${market}</h4>`;
            cartItemsList.appendChild(marketHeader);

            // Lista de itens deste mercado
            items.forEach(item => {
                const cartItem = createModalListItem(item, true);
                cartItemsList.appendChild(cartItem);
            });

            // Subtotal do mercado
            const marketSubtotal = items.reduce((sum, it) => sum + (parseFloat(it.price) * (it.quantity || 1)), 0);
            grandTotal += marketSubtotal;

            const subtotalNode = document.createElement('div');
            subtotalNode.className = 'market-subtotal';
            subtotalNode.innerHTML = `<div class="subtotal-row"><span>Subtotal ${market}:</span><strong>${formatPrice(marketSubtotal)}</strong></div>`;
            cartItemsList.appendChild(subtotalNode);
        });

        // Total geral ao final da lista
        const totalNode = document.createElement('div');
        totalNode.className = 'cart-grand-total';
        totalNode.innerHTML = `<div class="grand-total-row"><span>Total Geral:</span><strong>${formatPrice(grandTotal)}</strong></div>`;
        cartItemsList.appendChild(totalNode);

        // Atualiza o resumo do carrinho (elemento existente)
        cartTotalElement.textContent = formatPrice(grandTotal);
    };

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

    // Ao clicar em um card de produto (fora dos botões), abrir modal de detalhe
    productsList.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (!card) return;
        if (e.target.closest('button')) return; // ignore clicks on action buttons
        const id = card.dataset.productId;
        if (id) openProductDetail(id);
    });

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
            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                product.quantity = 1;
                cart.push(product);
            }
            saveToSessionStorage('cart', cart);
            alert(`${product.name} adicionado ao carrinho!`);
            renderCartItems();
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

    // Evento de submissão do formulário de sugestão
    modalSuggestionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const productId = modalSuggestionProductId.value;
        const productName = modalSuggestionProductName.value;
        const market = modalSuggestionMarket.value;
    const suggestedPrice = modalSuggestionNewPrice.value;
        
        if (!suggestedPrice) {
            alert('Por favor, insira um preço válido.');
            return;
        }

        const newSuggestion = {
            id: Date.now(),
            productId,
            productName,
            market,
            suggestedPrice: parseFloat(suggestedPrice).toFixed(2),
            date: new Date().toISOString()
        };

        const suggestions = getFromLocalStorage('suggestions'); // Sugestões persistem
        suggestions.push(newSuggestion);
        saveToLocalStorage('suggestions', suggestions); // Salva no localStorage

    alert('Sua sugestão foi enviada com sucesso e será analisada pela administração!');
    closeModal(suggestionModal);
        modalSuggestionForm.reset();
    });

    // Funções para bloquear/desbloquear scroll da página
    const lockBodyScroll = () => {
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.classList.add('modal-open');
    };

    const unlockBodyScroll = () => {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.classList.remove('modal-open');
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
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
    };

    const closeModal = (modal) => {
        if (!modal) return;
        
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
            const modal = btn.closest('.modal');
            closeModal(modal);
        });
    });

    closeCartBtn.addEventListener('click', () => {
        closeModal(cartModal);
    });

    // Fechar modais clicando fora (backdrop) - genérico para qualquer modal
    window.addEventListener('click', (e) => {
        try {
            if (e.target && e.target.classList && e.target.classList.contains('modal')) {
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

    // Handler para CTA de código de barras: abrir scanner sem focar input para evitar teclado móvel
    const barcodeBtn = document.getElementById('barcode-search-btn');
    if (barcodeBtn) {
        barcodeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Evitar que algum input permaneça focado
            try {
                if (document.activeElement && document.activeElement !== document.body) {
                    document.activeElement.blur();
                }
            } catch(_) {}
            // Usar implementação central
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

// Função global para abrir detalhes (mantida fora do listener para acesso geral)
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

// Fallback: após window load, garantir render se produtos já estiverem no localStorage
window.addEventListener('load', () => {
    try {
        const stored = JSON.parse(localStorage.getItem('products') || '[]');
        console.log(`🧪 Fallback load listener: ${stored.length} produtos no localStorage`);
        if (stored.length > 0 && typeof window.renderProducts === 'function') {
            window.renderProducts(stored);
            if (typeof updateFilterOptions === 'function') updateFilterOptions();
        }
    } catch (e) {
        console.warn('Falha no fallback de renderização:', e);
    }

    // Registrar Service Worker para PWA
    try {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/js/service-worker.js')
                .then(reg => console.log('ServiceWorker registrado (index):', reg.scope))
                .catch(err => console.error('Falha ao registrar ServiceWorker:', err));
        }
    } catch (err) {
        console.warn('ServiceWorker não suportado ou erro:', err);
    }


// Listener fora do DOMContentLoaded para não perder evento precoce
window.addEventListener('productsLoaded', (event) => {
    try {
        console.log('📦 Listener externo productsLoaded:', event.detail);
        if (typeof window.renderProducts === 'function') {
            window.renderProducts(event.detail.products);
            if (typeof updateFilterOptions === 'function') updateFilterOptions();
        }
    } catch (e) {
        console.warn('Falha ao processar productsLoaded externo:', e);
    }
});

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
        
        productCard.innerHTML = `
            <img src="${product.imageUrl || DEFAULT_IMAGE_URL}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${formatPrice(product.price)}</p>
                <p class="product-details concise compact">
                    <span class="meta-item"><strong>Mercado:</strong> ${product.market}</span>
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
        return productCard;
    };

    // Product detail modal logic
    const productDetailModal = document.getElementById('product-detail-modal');
    const closeProductDetailBtn = document.getElementById('close-product-detail');
    const detailImage = document.getElementById('detail-image');
    const detailName = document.getElementById('detail-name');
    const detailPrice = document.getElementById('detail-price');
    const detailMeta = document.getElementById('detail-meta');
    const detailDescription = document.getElementById('detail-description');
    const detailFavBtn = document.getElementById('detail-fav');
    const detailCartBtn = document.getElementById('detail-cart');
    const detailCompareBtn = document.getElementById('detail-compare');

    const openProductDetail = (productId) => {
        const products = getFromLocalStorage('products');
        const p = products.find(x => String(x.id) === String(productId));
        if (!p) return;
        detailImage.src = p.imageUrl || DEFAULT_IMAGE_URL;
        detailName.textContent = p.name;
        detailPrice.textContent = formatPrice(p.price);
        detailMeta.innerHTML = `
            ${p.barcode ? `<div><strong>Código de Barras:</strong> <code style="background:#f0f8ff;padding:2px 6px;border-radius:4px;font-family:monospace;">${p.barcode}</code></div>` : ''}
            <div><strong>Mercado:</strong> ${p.market || '—'}</div>
            <div><strong>Marca:</strong> ${p.brand || '—'}</div>
            <div><strong>Categoria:</strong> ${p.category || '—'}</div>
            <div><strong>Unidade:</strong> ${(p.quantity || '1')} ${p.unit || 'unidade'}</div>
            ${p.zone ? `<div><strong>Zona:</strong> ${p.zone}</div>` : ''}
            ${p.parish ? `<div><strong>Freguesia:</strong> ${p.parish}</div>` : ''}
        `;
        detailDescription.textContent = p.description || '';
        
        // Mostrar/ocultar seção de descrição
        const descriptionContainer = document.getElementById('detail-description-container');
        if (p.description && p.description.trim()) {
            descriptionContainer.style.display = 'block';
        } else {
            descriptionContainer.style.display = 'none';
        }

        // set fav state on detail
        const favs = getFromSessionStorage('favorites');
        if (favs.some(f => String(f.id) === String(p.id))) detailFavBtn.classList.add('active'); else detailFavBtn.classList.remove('active');

        // bind actions
        detailFavBtn.onclick = () => {
            let favorites = getFromSessionStorage('favorites');
            const exists = favorites.some(f => String(f.id) === String(p.id));
            if (exists) favorites = favorites.filter(f => String(f.id) !== String(p.id)); else favorites.push(p);
            saveToSessionStorage('favorites', favorites);
            renderFavorites();
            renderProducts();
            detailFavBtn.classList.toggle('active');
            if (!exists) alert(`${p.name} adicionado aos favoritos!`);
        };

        detailCartBtn.onclick = () => {
            const cart = getFromSessionStorage('cart');
            const existing = cart.find(i => String(i.id) === String(p.id));
            if (existing) existing.quantity = (existing.quantity || 1) + 1; else { const copy = Object.assign({}, p); copy.quantity = 1; cart.push(copy); }
            saveToSessionStorage('cart', cart);
            renderCartItems();
            alert(`${p.name} adicionado ao carrinho!`);
        };

    detailCompareBtn.onclick = () => { closeModal(productDetailModal); openCompareModal(p.name); };

        openModal(productDetailModal);
    };

    if (closeProductDetailBtn) closeProductDetailBtn.addEventListener('click', () => closeModal(productDetailModal));

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
            <img src="${product.imageUrl || DEFAULT_IMAGE_URL}" alt="${product.name}" class="modal-item-image">
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
        // Garante que o estado dos botões é verificado após a renderização
        setTimeout(manageScrollButtons, 100);
    };
    
    // Tornar renderProducts disponível globalmente para firebase-loader.js
    window.renderProducts = renderProducts;

    // Compare modal helpers
    const compareModal = document.getElementById('compare-modal');
    const compareList = document.getElementById('compare-list');
    const compareEmpty = document.getElementById('compare-empty');
    const compareTitle = document.getElementById('compare-modal-title');
    const closeCompareBtn = document.getElementById('close-compare-btn');

    const normalizeName = (name) => name ? name.toString().toLowerCase().replace(/\s+/g, ' ').trim() : '';

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

    const openCompareModal = (productName) => {
        const products = getFromLocalStorage('products');
        const normalized = normalizeName(productName);
        const isGenericArrozSearch = normalized === 'arroz';

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

        // helper: consider two names similar if they share the same first 2+ words or high overlap
        const areNamesSimilar = (n1, n2) => {
            if (!n1 || !n2) return false;
            const a = normalizeName(n1).split(' ');
            const b = normalizeName(n2).split(' ');
            // require at least 2 words to compare usefully
            const minWords = 2;
            const common = a.filter((w, i) => b[i] === w).length;
            if (common >= minWords) return true;
            // fallback: compute overlap ratio
            const setA = new Set(a);
            const setB = new Set(b);
            const intersection = [...setA].filter(x => setB.has(x)).length;
            const union = new Set([...setA, ...setB]).size;
            if (union === 0) return false;
            const ratio = intersection / union;
            return ratio >= 0.5; // 50% overlap considered similar
        };

        // expand matches to include names that are similar by words (helps when only brand differs)
        const extra = products.filter(p => !matches.includes(p) && areNamesSimilar(p.name, productName));
        if (extra.length) {
            matches.push(...extra);
        }

        // fallback: if no matches by core, try exact name or substring match
        if (matches.length === 0) {
            matches = products.filter(p => normalizeName(p.name) === normalized);
            if (matches.length === 0) {
                matches = products.filter(p => normalizeName(p.name).includes(normalized));
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
        if (!matches || matches.length === 0) {
            compareEmpty.style.display = 'block';
            compareTitle.textContent = `Comparar: ${productName}`;
            openModal(compareModal);
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
        highlightCard.innerHTML = `
            <div class="highlight-left">
                <img src="${cheapestGlobal.imageUrl || DEFAULT_IMAGE_URL}" alt="${cheapestGlobal.name}" class="highlight-image" loading="lazy">
            </div>
            <div class="highlight-main">
                <h3 class="highlight-name">${cheapestGlobal.name}</h3>
                <div class="highlight-meta">
                    <span class="highlight-market">${cheapestGlobal.market || ''}</span>
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
                <div class="cli-market-col">${p.market || ''}</div>
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

        // Se viewport > 720, usa layout desktop. Para mobile, usaremos uma versão linear simplificada.
        if (typeof window !== 'undefined' && window.innerWidth > 720) {
            compareList.appendChild(desktopLayout);
            openModal(compareModal);
            return; // interrompe antes do layout antigo
        }

        // ===== Novo fluxo para MOBILE: destaque + lista linear =====
        if (typeof window !== 'undefined' && window.innerWidth <= 720) {
            const mobileLayout = document.createElement('div');
            mobileLayout.className = 'compare-mobile-redesign';

            // destaque (reutiliza o mesmo HTML de destaque)
            const mobileHighlight = document.createElement('div');
            mobileHighlight.className = 'compare-highlight-card';
            mobileHighlight.innerHTML = `
                <div class="highlight-left">
                    <img src="${cheapestGlobal.imageUrl || DEFAULT_IMAGE_URL}" alt="${cheapestGlobal.name}" class="highlight-image" loading="lazy">
                </div>
                <div class="highlight-main">
                    <h3 class="highlight-name">${cheapestGlobal.name}</h3>
                    <div class="highlight-meta">
                        <span class="highlight-market">${cheapestGlobal.market || ''}</span>
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
            mobileLayout.appendChild(mobileHighlight);

            // lista linear dos demais
            const mobileList = document.createElement('div');
            mobileList.className = 'compare-linear-list';
            const base = parseFloat(cheapestGlobal.price);
            const diffPct = (price) => {
                const current = parseFloat(price);
                if (!isFinite(base) || base <= 0) return '—';
                const pct = ((current - base) / base) * 100;
                if (pct === 0) return 'Igual';
                const str = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
                return str;
            };
            others.forEach(p => {
                const node = document.createElement('div');
                node.className = 'compare-linear-item';
                node.dataset.productId = p.id;
                node.innerHTML = `
                    <div class="cli-image-col">
                        <img src="${p.imageUrl || DEFAULT_IMAGE_URL}" alt="${p.name}" class="cli-image" loading="lazy">
                    </div>
                    <div class="cli-name-col" title="${p.name}">${p.name}</div>
                    <div class="cli-market-col">${p.market || ''}</div>
                    <div class="cli-price-col">${formatPrice(p.price)}</div>
                    <div class="cli-diff-col">${diffPct(p.price)}</div>
                    <div class="cli-actions-col">
                        <button class="fav-btn ${isFav(p.id) ? 'fav-active' : ''}" aria-pressed="${isFav(p.id)}" data-id="${p.id}" title="Favoritar"><i class="fas fa-heart"></i></button>
                        <button class="cart-btn ${inCart(p.id) ? 'adicionado in-cart' : ''}" aria-pressed="${inCart(p.id)}" data-id="${p.id}" title="Adicionar ao carrinho"><i class="fas fa-shopping-cart"></i></button>
                    </div>
                `;
                mobileList.appendChild(node);
            });
            mobileLayout.appendChild(mobileList);

            openComparePage(productName, mobileLayout);
            return;
        }

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
        openModal(compareModal);

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
                <button id="compare-page-back" class="compare-page-back">← Voltar</button>
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

        // push history state so native back works
        try { history.pushState({ comparePage: true, product: productName }, '', '#compare'); } catch (e) { /* ignore */ }

        const onPop = (e) => {
            // if state no longer indicates compare page, close it
            if (!e.state || !e.state.comparePage) closeComparePage();
        };
        window.addEventListener('popstate', onPop);
        // store listener so we can remove later
        comparePage._onPop = onPop;

        // Bind delegated actions for favorites/cart inside the mobile compare page
        if (!comparePage._onFavCart) {
            comparePage._onFavCart = (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;
                const id = btn.dataset && btn.dataset.id;
                if (!id) return;
                // Favoritar
                if (btn.classList.contains('fav-btn')) {
                    let favorites = getFromSessionStorage('favorites');
                    const isFav = favorites.some(f => String(f.id) === String(id));
                    if (isFav) {
                        favorites = favorites.filter(f => String(f.id) !== String(id));
                    } else {
                        const product = getFromLocalStorage('products').find(p => String(p.id) === String(id));
                        if (product) favorites.push(product);
                    }
                    saveToSessionStorage('favorites', favorites);
                    renderFavorites();
                    renderProducts();
                    // toggle visual state
                    const nowFav = !isFav;
                    btn.classList.toggle('fav-active', nowFav);
                    btn.setAttribute('aria-pressed', String(nowFav));
                    const notice = document.getElementById('compare-action-notice');
                    if (notice) {
                        notice.textContent = nowFav ? 'Adicionado aos favoritos' : 'Removido dos favoritos';
                        notice.className = 'compare-action-notice ' + (nowFav ? 'success' : 'info');
                        notice.style.display = 'block';
                        // auto-hide after 2.5s
                        clearTimeout(notice._t);
                        notice._t = setTimeout(()=> notice.style.display='none', 2500);
                    }
                    try { showToast(nowFav ? 'Adicionado aos favoritos' : 'Removido dos favoritos', { type: 'info' }); } catch(_) {}
                }
                // Carrinho
                if (btn.classList.contains('cart-btn')) {
                    const cart = getFromSessionStorage('cart');
                    const product = getFromLocalStorage('products').find(p => String(p.id) === String(id));
                    if (product) {
                        const existing = cart.find(i => String(i.id) === String(id));
                        if (existing) existing.quantity = (existing.quantity || 1) + 1;
                        else { const copy = Object.assign({}, product); copy.quantity = 1; cart.push(copy); }
                        saveToSessionStorage('cart', cart);
                        renderCartItems();
                        btn.classList.add('adicionado','in-cart');
                        btn.setAttribute('aria-pressed','true');
                        const notice = document.getElementById('compare-action-notice');
                        if (notice) {
                            notice.textContent = `${product.name} adicionado ao carrinho`;
                            notice.className = 'compare-action-notice success';
                            notice.style.display = 'block';
                            clearTimeout(notice._t);
                            notice._t = setTimeout(()=> notice.style.display='none', 2500);
                        }
                        try { showToast(`${product.name} adicionado ao carrinho`, { type: 'success' }); } catch(_) {}
                    }
                }
            };
            comparePage.addEventListener('click', comparePage._onFavCart);
        }

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
        if (backBtn) backBtn.onclick = () => { history.back(); };

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
        comparePage.innerHTML = '';
        document.documentElement.style.overflow = '';
        // remove the hash without navigating if it points to compare
        try {
            if (location.hash === '#compare') history.replaceState({}, '', location.pathname + location.search);
        } catch (e) { /* ignore */ }
    };

    // show product details inside the compare modal (replaces compare content)
    const showCompareItemDetail = (productId) => {
        const products = getFromLocalStorage('products');
        const p = products.find(x => String(x.id) === String(productId));
        if (!p) return;
        const esc = (s) => (s || '').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

        // update title and render a compact detail view inside the compare list container
        compareTitle.textContent = `Detalhes: ${p.name}`;
        compareList.innerHTML = `
            <div class="compare-detail">
                <button id="compare-detail-back" class="compare-detail-back">← Voltar</button>
                <div class="compare-detail-grid">
                    <div class="detail-image-col">
                        <img src="${esc(p.imageUrl || DEFAULT_IMAGE_URL)}" alt="${esc(p.name)}" class="detail-image">
                    </div>
                    <div class="detail-info-col">
                        <h3 class="detail-name">${esc(p.name)}</h3>
                        <div class="detail-price">${formatPrice(p.price)}</div>
                        <div class="detail-meta">
                            <div><strong>Mercado:</strong> ${esc(p.market || '—')}</div>
                            <div><strong>Marca:</strong> ${esc(p.brand || '—')}</div>
                            <div><strong>Categoria:</strong> ${esc(p.category || '—')}</div>
                            <div><strong>Unidade:</strong> ${esc(p.quantity||'')} ${esc(p.unit||'')}</div>
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

        // back button restores the comparison view by re-opening it with the original product name
        const backBtn = document.getElementById('compare-detail-back');
        if (backBtn) backBtn.addEventListener('click', () => {
            const original = (compareModal && compareModal.dataset.compareProduct) ? compareModal.dataset.compareProduct : p.name;
            openCompareModal(original);
        });
    };

    if (closeCompareBtn) closeCompareBtn.addEventListener('click', () => closeModal(compareModal));

    // Delegated events inside compare modal for fav/cart
    compareList.addEventListener('click', (e) => {
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

    const renderRecentProducts = () => {
        const products = getFromLocalStorage('products');
        const recentProducts = products.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 5);

        if (!recentProductsList) return; // Proteção caso o elemento não exista
        
        recentProductsList.innerHTML = '';
        if (recentProducts.length === 0) {
            if (noRecentProductsMessage) noRecentProductsMessage.style.display = 'block';
        } else {
            if (noRecentProductsMessage) noRecentProductsMessage.style.display = 'none';
            recentProducts.forEach(product => {
                const productCard = createProductCard(product);
                recentProductsList.appendChild(productCard);
            });
        }
    };

    // Lógica para Favoritos
    const renderFavorites = () => {
        const favorites = getFromSessionStorage('favorites');
        favoritesList.innerHTML = '';
        if (favorites.length === 0) {
            noFavoritesMessage.style.display = 'block';
        } else {
            noFavoritesMessage.style.display = 'none';
            favorites.forEach(product => {
                const listItem = createModalListItem(product, false);
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

        if (!cart || cart.length === 0) {
            emptyCartMessage.style.display = 'block';
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

        let grandTotal = 0;

        Object.keys(groups).forEach(market => {
            const items = groups[market];
            // Cabeçalho do mercado
            const marketHeader = document.createElement('div');
            marketHeader.className = 'cart-market-header';
            marketHeader.innerHTML = `<h4 class="market-name">${market}</h4>`;
            cartItemsList.appendChild(marketHeader);

            // Lista de itens deste mercado
            items.forEach(item => {
                const cartItem = createModalListItem(item, true);
                cartItemsList.appendChild(cartItem);
            });

            // Subtotal do mercado
            const marketSubtotal = items.reduce((sum, it) => sum + (parseFloat(it.price) * (it.quantity || 1)), 0);
            grandTotal += marketSubtotal;

            const subtotalNode = document.createElement('div');
            subtotalNode.className = 'market-subtotal';
            subtotalNode.innerHTML = `<div class="subtotal-row"><span>Subtotal ${market}:</span><strong>${formatPrice(marketSubtotal)}</strong></div>`;
            cartItemsList.appendChild(subtotalNode);
        });

        // Total geral ao final da lista
        const totalNode = document.createElement('div');
        totalNode.className = 'cart-grand-total';
        totalNode.innerHTML = `<div class="grand-total-row"><span>Total Geral:</span><strong>${formatPrice(grandTotal)}</strong></div>`;
        cartItemsList.appendChild(totalNode);

        // Atualiza o resumo do carrinho (elemento existente)
        cartTotalElement.textContent = formatPrice(grandTotal);
    };

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

    // Ao clicar em um card de produto (fora dos botões), abrir modal de detalhe
    productsList.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (!card) return;
        if (e.target.closest('button')) return; // ignore clicks on action buttons
        const id = card.dataset.productId;
        if (id) openProductDetail(id);
    });

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
            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                product.quantity = 1;
                cart.push(product);
            }
            saveToSessionStorage('cart', cart);
            alert(`${product.name} adicionado ao carrinho!`);
            renderCartItems();
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

    // Evento de submissão do formulário de sugestão
    modalSuggestionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const productId = modalSuggestionProductId.value;
        const productName = modalSuggestionProductName.value;
        const market = modalSuggestionMarket.value;
    const suggestedPrice = modalSuggestionNewPrice.value;
        
        if (!suggestedPrice) {
            alert('Por favor, insira um preço válido.');
            return;
        }

        const newSuggestion = {
            id: Date.now(),
            productId,
            productName,
            market,
            suggestedPrice: parseFloat(suggestedPrice).toFixed(2),
            date: new Date().toISOString()
        };

        const suggestions = getFromLocalStorage('suggestions'); // Sugestões persistem
        suggestions.push(newSuggestion);
        saveToLocalStorage('suggestions', suggestions); // Salva no localStorage

    alert('Sua sugestão foi enviada com sucesso e será analisada pela administração!');
    closeModal(suggestionModal);
        modalSuggestionForm.reset();
    });

    // Funções para bloquear/desbloquear scroll da página
    const lockBodyScroll = () => {
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.classList.add('modal-open');
    };

    const unlockBodyScroll = () => {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.classList.remove('modal-open');
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
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
    };

    const closeModal = (modal) => {
        if (!modal) return;
        
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
            const modal = btn.closest('.modal');
            closeModal(modal);
        });
    });

    closeCartBtn.addEventListener('click', () => {
        closeModal(cartModal);
    });

    // Fechar modais clicando fora (backdrop) - genérico para qualquer modal
    window.addEventListener('click', (e) => {
        try {
            if (e.target && e.target.classList && e.target.classList.contains('modal')) {
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
        const hasLockClass = document.body.classList.contains('modal-open');
        const anyModalOpen = !!document.querySelector('.modal.show');
        if (!(hasLockClass && anyModalOpen)) return;
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

// Função global para abrir detalhes (mantida fora do listener para acesso geral)
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

// Fallback: após window load, garantir render se produtos já estiverem no localStorage
window.addEventListener('load', () => {
    try {
        const stored = JSON.parse(localStorage.getItem('products') || '[]');
        console.log(`🧪 Fallback load listener: ${stored.length} produtos no localStorage`);
        if (stored.length > 0 && typeof window.renderProducts === 'function') {
            window.renderProducts(stored);
            if (typeof updateFilterOptions === 'function') updateFilterOptions();
        }
    } catch (e) {
        console.warn('Falha no fallback de renderização:', e);
    }

    // Registrar Service Worker para PWA
    try {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/js/service-worker.js')
                .then(reg => console.log('ServiceWorker registrado (index):', reg.scope))
                .catch(err => console.error('Falha ao registrar ServiceWorker:', err));
        }
    } catch (err) {
        console.warn('ServiceWorker não suportado ou erro:', err);
    }
});

// Listener fora do DOMContentLoaded para não perder evento precoce
window.addEventListener('productsLoaded', (event) => {
    try {
        console.log('📦 Listener externo productsLoaded:', event.detail);
        if (typeof window.renderProducts === 'function') {
            window.renderProducts(event.detail.products);
            if (typeof updateFilterOptions === 'function') updateFilterOptions();
        }
    } catch (e) {
        console.warn('Falha ao processar productsLoaded externo:', e);
    }
});