import re

# Read the file
with open('js/script_fixed.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the fav-btn check to include favorite-btn
content = re.sub(
    r"if \(btn\.classList\.contains\('fav-btn'\)\) \{",
    "// Suporta tanto fav-btn quanto favorite-btn\n        if (btn.classList.contains('fav-btn') || btn.classList.contains('favorite-btn')) {",
    content
)

# Replace the cart-btn check to include add-to-cart-btn
content = re.sub(
    r"} else if \(btn\.classList\.contains\('cart-btn'\)\) \{",
    "} else if (btn.classList.contains('cart-btn') || btn.classList.contains('add-to-cart-btn')) {",
    content
)

# Add favorited class toggle
content = re.sub(
    r"(btn\.classList\.toggle\('fav-active', nowFav\);)\n(\s+)(btn\.setAttribute)",
    r"\1\n\2btn.classList.toggle('favorited', nowFav);\n\2\3",
    content
)

# Write the file back
with open('js/script_fixed.js', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print("✅ Arquivo corrigido com sucesso!")
