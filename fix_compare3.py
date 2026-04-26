import re

# Read the file
with open('js/script_fixed.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Count occurrences before replacement
count_fav = content.count("if (btn.classList.contains('fav-btn')) {")
count_cart = content.count("} else if (btn.classList.contains('cart-btn')) {")

print(f"Found {count_fav} occurrences of fav-btn check")
print(f"Found {count_cart} occurrences of cart-btn check")

# Replace the fav-btn check to include favorite-btn
old_fav = "if (btn.classList.contains('fav-btn')) {"
new_fav = "// Suporta tanto fav-btn quanto favorite-btn\n        if (btn.classList.contains('fav-btn') || btn.classList.contains('favorite-btn')) {"
content = content.replace(old_fav, new_fav)

# Replace the cart-btn check to include add-to-cart-btn  
old_cart = "} else if (btn.classList.contains('cart-btn')) {"
new_cart = "} else if (btn.classList.contains('cart-btn') || btn.classList.contains('add-to-cart-btn')) {"
content = content.replace(old_cart, new_cart)

# Add favorited class toggle
old_toggle = "btn.classList.toggle('fav-active', nowFav);\n            btn.setAttribute('aria-pressed'"
new_toggle = "btn.classList.toggle('fav-active', nowFav);\n            btn.classList.toggle('favorited', nowFav);\n            btn.setAttribute('aria-pressed'"
content = content.replace(old_toggle, new_toggle)

# Write the file back
with open('js/script_fixed.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Arquivo corrigido com sucesso!")
print(f"Replaced {count_fav} fav-btn checks")
print(f"Replaced {count_cart} cart-btn checks")
