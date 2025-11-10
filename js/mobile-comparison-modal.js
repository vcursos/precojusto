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
                </div>
            `;
            
            // Simplified list items for other products - NO IMAGES
            sortedProducts.slice(1).forEach(product => {
                const priceDifference = calculatePriceDifference(product.price, lowestPrice);
                
                const listItem = document.createElement('li');
                listItem.className = 'other-product-item';
                listItem.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eee; background: white; border-radius: 8px; margin-bottom: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);';
                
                listItem.innerHTML = `
                    <div class="product-info" style="flex: 1; min-width: 0;">
                        <div class="product-name" style="font-weight: bold; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${product.name}
                        </div>
                        <div class="product-market" style="color: #6b7280; font-size: 14px;">
                            ${product.market}
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="product-price" style="font-weight: bold; color: #111827; font-size: 16px; white-space: nowrap;">
                            ${formatPrice(product.price)}
                        </div>
                        <div class="price-difference" style="background-color: #fee2e2; color: #ef4444; padding: 3px 8px; border-radius: 16px; font-size: 12px; white-space: nowrap;">
                            +${priceDifference}%
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
