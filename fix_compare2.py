import re

# Read the file
with open('js/script_fixed.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Count occurrences before replacement
count_fav = len(re.findall(r"if \(btn\.classList\.contains\('fav-btn'\)\) \{", content))
count_cart = len(re.findall(r"\} else if \(btn\.classList\.contains\('cart-btn'\)\) \{", content))

print(f"Found {count_fav} occurrences of fav-btn check")
print(f"Found {count_cart} occurrences of cart-btn check")

# Replace the fav-btn check to include favorite-btn
content = re.sub(
    r"if \(btn\.classList\.contains\('fav-btn'\)\) \{",
    "// Suporta tanto fav-btn quanto favorite-btn\n        if (btn.classList.contains('fav-btn') || btn.classList.contains('favorite-btn')) {",
    content
)

# Replace the cart-btn check to include add-to-cart-btn
content = re.sub(
    r"\} else if \(btn\.classList\.contains\('cart-btn'\)\) \{",
    "} else if (btn.classList.contains('cart-btn') || btn.classList.contains('add-to-cart-btn')) {",
    content
)

# Add favorited class toggle - be more specific
content = re.sub(
    r"btn\.classList\.toggle\('fav-active', nowFav\);\n(\s+)btn\.setAttribute\('aria-pressed'",
    r"btn.classList.toggle('fav-active', nowFav);\n\1btn.classList.toggle('favorited', nowFav);\n\1btn.setAttribute('aria-pressed'",
    content
)

# Write the file back
with open('js/script_fixed.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Arquivo corrigido com sucesso!")
