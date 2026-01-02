// Categoria rápida para home - usa produtos já carregados no localStorage pelo script principal
(function(){
    const MAIN_CATEGORY_ORDER = [
        'Frescos', 'Mercearia', 'Bebidas', 'Laticínios',
        'Congelados', 'Padaria', 'Higiene', 'Limpeza'
    ];
    let activeCategory = '';

    const categoryTabs = document.getElementById('category-tabs');
    const categoryProductsGrid = document.getElementById('category-products');
    const categoryPrevBtn = document.getElementById('category-prev');
    const categoryNextBtn = document.getElementById('category-next');
    const categoryEmptyMessage = document.getElementById('category-empty');

    if (!categoryTabs || !categoryProductsGrid) return; // seção não existe

    const normalizeCategory = (value) => (value || 'Outros').toString().trim();

    const getProducts = () => {
        try {
            const data = JSON.parse(localStorage.getItem('products') || '[]');
            return Array.isArray(data) ? data : [];
        } catch (_) {
            return [];
        }
    };

    const getPrimaryCategories = () => {
        const products = getProducts();
        const counts = products.reduce((acc, p) => {
            const cat = normalizeCategory(p.category);
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {});

        const prioritized = MAIN_CATEGORY_ORDER.filter(cat => counts[cat]);
        const extras = Object.entries(counts)
            .filter(([cat]) => !MAIN_CATEGORY_ORDER.includes(cat))
            .sort((a, b) => b[1] - a[1])
            .map(([cat]) => cat);

        const merged = [...prioritized, ...extras];
        return merged.slice(0, 6);
    };

    const updateNavVisibility = () => {
        if (!categoryProductsGrid || !categoryPrevBtn || !categoryNextBtn) return;
        const scrollable = (categoryProductsGrid.scrollWidth - categoryProductsGrid.clientWidth) > 4;
        const itemsCount = categoryProductsGrid.children.length || 0;
        const forceShowOnMobile = window.innerWidth <= 768 && itemsCount > 1;
        const show = scrollable || forceShowOnMobile;
        categoryPrevBtn.style.display = show ? 'flex' : 'none';
        categoryNextBtn.style.display = show ? 'flex' : 'none';
    };

    const renderCategoryProducts = (category) => {
        const products = getProducts().filter(p => normalizeCategory(p.category) === category);
        categoryProductsGrid.innerHTML = '';

        if (!products.length) {
            categoryEmptyMessage.style.display = 'block';
            updateNavVisibility();
            return;
        }
        categoryEmptyMessage.style.display = 'none';

        products
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
            .slice(0, 20)
            .forEach(p => {
                const card = document.createElement('div');
                card.className = 'product-card new-product-card';
                card.dataset.productId = p.id;
                card.innerHTML = `
                    <img src="${p.imageUrl || 'https://png.pngtree.com/png-vector/20241025/ourmid/png-tree-grocery-cart-filled-with-fresh-vegetables-png-image_14162473.png'}" alt="${p.name}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-name">${p.name}</h3>
                        <p class="product-price">€ ${(Number(p.price) || 0).toFixed(2)}</p>
                        <p class="product-details concise compact">
                            <span class="meta-item"><strong>Mercado:</strong> ${p.market || '—'}</span>
                            <span class="meta-item"><strong>Marca:</strong> ${p.brand || '—'}</span>
                        </p>
                    </div>
                `;
                card.addEventListener('click', () => {
                    if (typeof window.openProductDetail === 'function') {
                        window.openProductDetail(p.id);
                        return;
                    }
                    window.location.href = `produto.html?id=${p.id}`;
                });
                categoryProductsGrid.appendChild(card);
            });

        // ajuste de visibilidade dos botões após render
        requestAnimationFrame(updateNavVisibility);
    };

    // Navegação por setas (carrossel)
    const scrollAmount = 320;
    if (categoryPrevBtn && categoryNextBtn && categoryProductsGrid) {
        categoryPrevBtn.addEventListener('click', () => {
            categoryProductsGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        categoryNextBtn.addEventListener('click', () => {
            categoryProductsGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
        categoryProductsGrid.addEventListener('scroll', updateNavVisibility);
        window.addEventListener('resize', updateNavVisibility);
    }

    const buildCategoryTabs = (categories) => {
        categoryTabs.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'category-tab' + (cat === activeCategory ? ' active' : '');
            btn.textContent = cat;
            btn.addEventListener('click', () => {
                if (cat === activeCategory) return;
                activeCategory = cat;
                buildCategoryTabs(categories);
                renderCategoryProducts(cat);
            });
            categoryTabs.appendChild(btn);
        });
    };

    const refreshCategories = () => {
        const categories = getPrimaryCategories();
        if (!categories.length) {
            categoryEmptyMessage.style.display = 'block';
            categoryTabs.innerHTML = '';
            categoryProductsGrid.innerHTML = '';
            return;
        }
        categoryEmptyMessage.style.display = 'none';
        if (!activeCategory || !categories.includes(activeCategory)) {
            activeCategory = categories[0];
        }
        buildCategoryTabs(categories);
        renderCategoryProducts(activeCategory);
    };

    // Inicializa e escuta eventos
    document.addEventListener('DOMContentLoaded', refreshCategories);
    window.addEventListener('productsLoaded', refreshCategories);
    
    // Fallback: tentar atualizar após 1 segundo se ainda não foi carregado
    setTimeout(() => {
        if (!activeCategory) {
            refreshCategories();
        }
    }, 1000);
})();
