# 💧 AQUA-CAMPO

**App PWA para coleta offline de entrevistas qualitativas**

Projeto: *Impactos da Escassez Hídrica na Agricultura Familiar da Região do Vale do Rio Cuiabá*

**Pesquisadora:** Maria Silvina da Cruz Gonçalves
**Orientador:** Prof. Dr. Ernandes Sobreira Oliveira Junior
**Instituição:** UNEMAT / ProfAgua — Cáceres-MT

---

## Arquivos do projeto

```
aqua-campo/
├── index.html      ← app principal
├── manifest.json   ← identidade do PWA
├── sw.js           ← service worker (offline)
├── icon-192.png    ← ícone do app
├── icon-512.png    ← ícone do app (alta resolução)
└── README.md
```

---

## Como publicar no GitHub Pages

### 1. Criar repositório no GitHub

- Acesse https://github.com → **New repository**
- Nome sugerido: `aqua-campo`
- Visibilidade: **Public**
- Clique em **Create repository**

### 2. Fazer upload dos arquivos

No repositório criado, clique em **"uploading an existing file"** e faça upload de todos os 5 arquivos:
- `index.html`
- `manifest.json`
- `sw.js`
- `icon-192.png`
- `icon-512.png`

Clique em **Commit changes**.

### 3. Ativar GitHub Pages

- No repositório → **Settings** → **Pages** (menu lateral)
- Em "Source": selecione **Deploy from a branch**
- Branch: **main** / pasta: **/ (root)**
- Clique em **Save**

Aguarde ~2 minutos. A URL do app será:
```
https://SEU-USUARIO.github.io/aqua-campo/
```

---

## Como a pesquisadora instala no celular

1. Abrir o link no **Chrome** (Android) ou **Safari** (iPhone)
2. Chrome: menu **⋮** → **"Adicionar à tela inicial"**
3. Safari: botão compartilhar **□↑** → **"Adicionar à Tela de Início"**
4. Confirmar → ícone aparece na tela inicial como app

**Pronto.** O app funciona 100% offline após o primeiro acesso.

---

## Como os dados são salvos offline

| Camada | Tecnologia | O que faz |
|--------|-----------|-----------|
| 1 | localStorage | Salva instantaneamente a cada entrevista |
| 2 | IndexedDB | Banco robusto do navegador |  
| 3 | sessionStorage | Cópia da sessão atual |
| 4 | Service Worker | Cache do app completo offline |

Os dados ficam gravados no Chrome do celular da pesquisadora. Ela pode fazer N entrevistas, fechar o app, reabrir — tudo acumula.

**Quando tiver internet:** abre o app → aba Exportar → baixa JSON ou CSV com todas as entrevistas.

---

## Atualizar o app

Para atualizar após mudanças:
1. Edite os arquivos localmente
2. No GitHub, clique no arquivo → **Edit** (lápis) → salve
3. O service worker atualiza automaticamente no próximo acesso com internet
