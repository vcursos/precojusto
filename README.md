# Preço Certo (PrecoJusto)

Aplicação web para comparar preços de produtos de supermercados, com suporte a scanner de código de barras, favoritos, carrinho, comparação avançada e modo PWA (instalável em Android e iOS, offline com fallback).

## Funcionalidades Principais
- Listagem de produtos (Firebase / localStorage)
- Filtros por mercado, marca e categoria
- Pesquisa por nome e por código de barras (com auto-preenchimento via câmera)
- Scanner (BarcodeDetector + fallback) dentro de modal
- Modal de comparação (desktop: destaque do mais barato + lista linear; mobile: layout simplificado)
- Favoritos e carrinho persistentes (session/localStorage)
- Sugestão de novo preço
- PWA: manifest, service worker, offline.html, botão de instalar, ícone maskable

## Estrutura do Projeto
```
index.html
admin.html
login.html
produto.html
offline.html
manifest.json
css/
js/
images/
```

## PWA
- Service Worker: `js/service-worker.js`
- Manifesto: `manifest.json`
- Offline fallback: `offline.html`
- Instalação: botão "Instalar App" aparece quando o evento `beforeinstallprompt` é disparado em navegadores compatíveis (Chrome Android).

## Requisitos
- Navegador moderno (Chrome, Edge, Firefox, Safari)
- Para recursos PWA e câmera: servir via HTTPS ou `http://localhost`

## Rodando Localmente
1. Clone ou copie os arquivos para uma pasta local.
2. Opcional: servir com um server estático para garantir caminhos corretos:
   - Python: `python -m http.server 5173`
   - Node (http-server): `npx http-server -p 5173`
3. Acesse em `http://localhost:5173/index.html`.

## Publicação no GitHub (Primeiro Push)
Caso ainda não tenha Git instalado:
- Instale: https://git-scm.com/downloads

### Passos (substitua `<seu-usuario>` pelo seu usuário real)
```powershell
# Dentro da pasta do projeto
cd "c:\Users\HP\Documents\Documentos Luis IMT\Precomercado internet"

# Inicializa o repositório
git init

# Garante que node_modules não será versionado (já existe .gitignore)
# Se node_modules estiver presente e já tiver sido adicionado, remova do índice
# (caso necessário)
# git rm -r --cached node_modules

# Adiciona tudo
git add .

# Primeiro commit
git commit -m "feat: primeira versão do Preço Certo (PWA)"

# Ajusta branch principal
git branch -M main

# Adiciona remoto (repositório já criado no GitHub)
git remote add origin https://github.com/<seu-usuario>/precojusto.git

# Push inicial
git push -u origin main
```

### Atualizações Futuras
```powershell
git add .
git commit -m "chore: ajustes de layout e PWA"
git push
```

## Ícones & Ajustes PWA
- Ícone maskable: `images/icons/maskable-icon.svg`
- Touch icons reutilizam `images/cabecalho.png`. Recomenda-se gerar PNGs dedicados (192x192, 512x512, 180x180) para maior qualidade.

## Melhorias Possíveis
- Ajustar breakpoints unificados (tarefa pendente: utilidades responsivas)
- Verificar tamanho mínimo de áreas clicáveis (44px) e acessibilidade
- Página de detalhes com histórico de alterações de preço
- Pre-cache seletivo de imagens mais acessadas
- Monitoramento de instalação PWA (analytics)

## Licença
Defina aqui a licença (por exemplo MIT). Se não especificar, o repositório fica sem licença explícita.

---
Desenvolvido para facilitar a economia comparando preços de supermercados.
