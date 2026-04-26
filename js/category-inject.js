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

    const CATEGORY_LABELS = {
        alimentos: 'Alimentos',
        talho: 'Talho',
        eletros: 'Eletros',
        limpeza: 'Limpeza',
        higiene: 'Higiene Pessoal',
        bebidas: 'Bebidas',
        frios: 'Laticínios e Frios',
        congelados: 'Congelados',
        padaria: 'Padaria e Pastelaria',
        suplementos: 'Suplementos',
        pets: 'Pets',
        casa: 'Casa e Decoração',
        cozinha: 'Cozinha e Mesa'
    };

    const normalizeCategoryKey = (value) => (value || 'Outros').toString().trim().toLowerCase();
    const normalizeCategoryLabel = (value) => {
        const raw = (value || 'Outros').toString().trim();
        const key = normalizeCategoryKey(raw);
        return CATEGORY_LABELS[key] || raw || 'Outros';
    };

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
        const meta = products.reduce((acc, p) => {
            const key = normalizeCategoryKey(p.category);
            if (!acc[key]) {
                acc[key] = {
                    label: normalizeCategoryLabel(p.category),
                    count: 0
                };
            }
            acc[key].count += 1;
            return acc;
        }, {});

        const prioritized = MAIN_CATEGORY_ORDER
            .map(cat => normalizeCategoryKey(cat))
            .filter(key => !!meta[key]);

        const extras = Object.entries(meta)
            .filter(([key]) => !prioritized.includes(key))
            .sort((a, b) => {
                // mantém mais populares primeiro, desempate por nome exibido
                if (b[1].count !== a[1].count) return b[1].count - a[1].count;
                return (a[1].label || '').localeCompare((b[1].label || ''), 'pt-BR');
            })
            .map(([key]) => key);

        const merged = [...prioritized, ...extras];
        return merged.map(key => ({ key, label: meta[key].label }));
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

    const renderCategoryProducts = (categoryKey) => {
        const products = getProducts().filter(p => normalizeCategoryKey(p.category) === categoryKey);
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
            btn.className = 'category-tab' + (cat.key === activeCategory ? ' active' : '');
            btn.textContent = cat.label;
            btn.addEventListener('click', () => {
                if (cat.key === activeCategory) return;
                activeCategory = cat.key;
                buildCategoryTabs(categories);
                renderCategoryProducts(cat.key);
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
        const keys = categories.map(c => c.key);
        if (!activeCategory || !keys.includes(activeCategory)) {
            activeCategory = categories[0].key;
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
