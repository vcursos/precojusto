# Patch script to fix compare modal event listeners

$file = "js\script_fixed.js"
$content = Get-Content $file -Raw

# Replace fav-btn check
$content = $content -replace "if \(btn\.classList\.contains\('fav-btn'\)\) \{", "// Suporta tanto fav-btn quanto favorite-btn`r`n        if (btn.classList.contains('fav-btn') || btn.classList.contains('favorite-btn')) {"

# Replace cart-btn check
$content = $content -replace "\} else if \(btn\.classList\.contains\('cart-btn'\)\) \{", "} else if (btn.classList.contains('cart-btn') || btn.classList.contains('add-to-cart-btn')) {"

# Add favorited class toggle
$content = $content -replace "btn\.classList\.toggle\('fav-active', nowFav\);", "btn.classList.toggle('fav-active', nowFav);`r`n            btn.classList.toggle('favorited', nowFav);"

# Save the file
$content | Set-Content $file -NoNewline

Write-Host "Patch aplicado com sucesso!"
