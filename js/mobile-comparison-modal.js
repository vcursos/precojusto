document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const modal = document.getElementById('mobileComparisonModal');
    const closeBtn = modal.querySelector('.mobile-comparison-modal__close');
    const openBtn = document.getElementById('openModalBtn');
    const bestPriceContainer = modal.querySelector('.best-price-product');
    const otherProductsList = modal.querySelector('.other-products-list');
    
    // Sample product data (replace with your actual data fetching mechanism)
    const products = [
        { 
            id: 1, 
            name: 'Délicieuse & Tropical Coco', 
            price: 0.88, 
            market: 'Desconhecido', 
            image: 'https://via.placeholder.com/100'
        },
        { 
            id: 2, 
            name: 'Délicieuse & Tropical Coco', 
            price: 0.88, 
            market: 'Desconhecido', 
            image: 'https://via.placeholder.com/100' 
        },
        { 
            id: 3, 
            name: 'Délicieuse & Tropical Coco', 
            price: 0.88, 
            market: 'Desconhecido', 
            image: 'https://via.placeholder.com/100' 
        }
    ];
    
    // Sort products by price (lowest first)
    function sortProductsByPrice(products) {
        return [...products].sort((a, b) => a.price - b.price);
    }
    
    // Format price as currency
    function formatPrice(price) {
        return price.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'EUR' 
        });
    }
    
    // Calculate percentage difference from lowest price
    function calculatePriceDifference(price, lowestPrice) {
        if (price <= lowestPrice) return 0;
        const difference = ((price - lowestPrice) / lowestPrice) * 100;
        return Math.round(difference);
    }
    
    // Render the comparison modal content
    function renderComparisonModal() {
        // Clear previous content
        bestPriceContainer.innerHTML = '';
        otherProductsList.innerHTML = '';
        
        // Sort products by price
        const sortedProducts = sortProductsByPrice(products);
        
        if (sortedProducts.length > 0) {
            const cheapestProduct = sortedProducts[0];
            const lowestPrice = cheapestProduct.price;
            
            // ENHANCED TOP PRODUCT - Larger and more prominent
            bestPriceContainer.innerHTML = `
                <div class="best-price-badge" style="background: linear-gradient(135deg, #10b981, #059669); font-size: 14px; padding: 5px 18px;">Mais barato</div>
                <div class="product-details" style="padding: 15px 10px; width: 100%;">
                    <div class="product-image-container" style="display: flex; justify-content: center; margin: 20px 0;">
                        <img src="${cheapestProduct.image}" alt="${cheapestProduct.name}" class="product-image" 
                             style="width: 56px; height: 121px; object-fit: contain; max-height: none;">
                    </div>
                    <h4 class="product-name" style="font-size: 18px; margin: 10px 0; text-align: center; width: 100%;">
                        ${cheapestProduct.name}
                    </h4>
                    <div class="product-price" style="font-size: 24px; font-weight: bold; color: #10b981; text-align: center; width: 100%;">
                        ${formatPrice(cheapestProduct.price)}
                    </div>
                    <div class="product-market" style="font-size: 16px; color: #475569; text-align: center; width: 100%; margin-top: 5px;">
                        ${cheapestProduct.market}
                    </div>
                    
                    <!-- Informações adicionais do produto -->
                    <div class="product-info-details" style="margin-top: 15px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
                        ${cheapestProduct.barcode ? `
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding: 8px; background-color: #eff6ff; border-radius: 6px;">
                            <i class="fas fa-barcode" style="color: #1e40af; font-size: 14px;"></i>
                            <div style="font-size: 12px;">
                                <div style="color: #1e40af; font-weight: 600;">Código</div>
                                <div style="color: #1e3a8a; font-weight: 500; font-family: monospace;">${cheapestProduct.barcode}</div>
                            </div>
                        </div>` : ''}
                        
                        ${cheapestProduct.unit ? `
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding: 8px; background-color: #fef3c7; border-radius: 6px;">
                            <i class="fas fa-weight" style="color: #92400e; font-size: 14px;"></i>
                            <div style="font-size: 12px;">
                                <div style="color: #92400e; font-weight: 600;">Medida</div>
                                <div style="color: #78350f; font-weight: 500;">${cheapestProduct.unit}</div>
                            </div>
                        </div>` : ''}
                        
                        ${cheapestProduct.country ? `
                        <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background-color: #fee2e2; border-radius: 6px;">
                            <i class="fas fa-globe" style="color: #7f1d1d; font-size: 14px;"></i>
                            <div style="font-size: 12px;">
                                <div style="color: #7f1d1d; font-weight: 600;">País</div>
                                <div style="color: #991b1b; font-weight: 500;">${cheapestProduct.country}</div>
                            </div>
                        </div>` : ''}
                    </div>
                </div>
            `;
            
            // Simplified list items for other products - NO IMAGES
            sortedProducts.slice(1).forEach(product => {
                const priceDifference = calculatePriceDifference(product.price, lowestPrice);
                
                const listItem = document.createElement('li');
                listItem.className = 'other-product-item';
                listItem.style.cssText = 'display: block; padding: 12px; border-bottom: 1px solid #eee; background: white; border-radius: 8px; margin-bottom: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);';
                
                let extraInfo = '';
                if (product.barcode || product.unit || product.country) {
                    extraInfo = `
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f0f0; display: flex; flex-wrap: wrap; gap: 8px;">
                        ${product.barcode ? `<span style="font-size: 11px; background-color: #eff6ff; color: #1e40af; padding: 4px 8px; border-radius: 4px;"><i class="fas fa-barcode"></i> ${product.barcode}</span>` : ''}
                        ${product.unit ? `<span style="font-size: 11px; background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px;"><i class="fas fa-weight"></i> ${product.unit}</span>` : ''}
                        ${product.country ? `<span style="font-size: 11px; background-color: #fee2e2; color: #7f1d1d; padding: 4px 8px; border-radius: 4px;"><i class="fas fa-globe"></i> ${product.country}</span>` : ''}
                    </div>
                    `;
                }
                
                listItem.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div class="product-info" style="flex: 1; min-width: 0;">
                            <div class="product-name" style="font-weight: bold; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${product.name}
                            </div>
                            <div class="product-market" style="color: #6b7280; font-size: 14px;">
                                ${product.market}
                            </div>
                            ${extraInfo}
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px; margin-left: 10px;">
                            <div class="product-price" style="font-weight: bold; color: #111827; font-size: 16px; white-space: nowrap;">
                                ${formatPrice(product.price)}
                            </div>
                            <div class="price-difference" style="background-color: #fee2e2; color: #ef4444; padding: 3px 8px; border-radius: 16px; font-size: 12px; white-space: nowrap;">
                                +${priceDifference}%
                            </div>
                        </div>
                    </div>
                `;
                
                otherProductsList.appendChild(listItem);
            });
        }
    }
    
    // Open modal
    function openModal() {
        modal.classList.add('active');
        renderComparisonModal();
    }
    
    // Close modal
    function closeModal() {
        modal.classList.remove('active');
    }
    
    // Event listeners
    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
});
