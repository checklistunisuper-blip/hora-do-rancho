# HORA DO RANCHO

**Compare preços. Economize mais.**
Um PWA (Progressive Web App) para comparar preços de supermercados próximos, montar uma lista de rancho dentro do orçamento e economizar — 100% front-end, sem back-end obrigatório, hospedável gratuitamente no GitHub Pages.

Desenvolvido por **WP DIGITAL VAREJO**.

## Tecnologias (todas gratuitas e abertas)

- HTML5, CSS3, JavaScript ES2023 (módulos nativos, sem build step)
- PWA: `manifest.json` + Service Worker (Cache API)
- IndexedDB + LocalStorage (armazenamento 100% local, sem servidor)
- Geolocation API (nativa do navegador)
- [Leaflet.js](https://leafletjs.com/) + tiles do [OpenStreetMap](https://www.openstreetmap.org/) — mapa gratuito, sem chave de API
- [Overpass API](https://overpass-api.de/) — busca de supermercados reais por geolocalização
- [Nominatim](https://nominatim.org/) — geocodificação reversa (estado/município/bairro)

## Estrutura do projeto

```
index.html            → shell do app + splash screen
manifest.json          → configuração do PWA (ícones, nome, cores)
service-worker.js      → cache offline (App Shell + APIs externas)
style.css              → tema Material Design (verde/laranja)
main.js                → bootstrap, rotas, tema, registro do service worker
assets/
  icons/                → ícones do app em todos os tamanhos (gerados a partir da logo)
  images/                → logo original (splash)
  data/mock-offers.json  → catálogo de exemplo usado pelo MockOfferProvider
components/             → funções de UI reutilizáveis (cards, chips, navbar)
pages/                  → uma "tela" do app por arquivo (home, mapa, ofertas, comparador, rancho, favoritos, perfil)
services/               → geolocalização, mercados (Overpass), ofertas, favoritos, notificações, storage
services/offerProviders/ → arquitetura modular de fontes de ofertas (ver abaixo)
models/                 → regras de negócio (ex: cálculo da Lista de Rancho)
utils/                  → roteador SPA e funções de formatação
config/                 → configuração central do app (inclui redes.json, as redes de mercado coletadas)
scripts/scraper/        → coletor Python que busca preços reais (roda via GitHub Action, não no navegador)
.github/workflows/      → deploy automático no Pages + coleta diária de ofertas
```

## Ofertas reais (coleta automática)

O app coleta **preços reais e públicos** das redes configuradas em `config/redes.json` (hoje: Zaffari e Carrefour, ambas com loja online própria na plataforma VTEX, que expõe uma API pública de busca de produtos — a mesma que o site delas usa no navegador do cliente).

Como isso funciona:

1. Uma **GitHub Action agendada** (`.github/workflows/scrape-ofertas.yml`, roda 1x por dia sozinha, de graça) executa `scripts/scraper/scrape_vtex.py`.
2. O script busca, por categoria, os produtos mais comuns (leite, arroz, carne, etc.) em cada rede configurada e salva tudo em `assets/data/scraped-offers.json`.
3. A Action commita esse arquivo atualizado de volta no repositório automaticamente.
4. No app, o `ScrapedFeedProvider` lê esse arquivo e casa cada oferta com o mercado físico certo **por nome** (se o mercado encontrado perto de você no mapa contém "Zaffari" ou "Carrefour" no nome, ele recebe os preços daquela rede).
5. Para mercados que ainda não têm nenhuma rede configurada, o app usa o `MockOfferProvider` (catálogo de exemplo) como reserva, só pra tela nunca ficar vazia — assim que você adicionar a rede em `config/redes.json`, os preços reais assumem automaticamente.

**Para rodar a coleta agora mesmo** (sem esperar o agendamento): na aba Actions do repositório, abra "Coletar ofertas reais" → "Run workflow".

**Para adicionar mais redes:** se a rede usa VTEX (muitas usam — Carrefour, Extra, Pão de Açúcar, entre outras), basta adicionar uma entrada em `config/redes.json` com o domínio da loja online e as palavras-chave pra casar com o nome no mapa. Se a rede usa outra plataforma, é preciso escrever uma função de coleta específica em `scripts/scraper/` (o HTML de cada plataforma é diferente).

### Arquitetura modular (para qualquer outra fonte)

Para conectar qualquer outra fonte de ofertas (API paga de uma rede parceira, feed de outro tipo), basta:

1. Criar uma classe em `services/offerProviders/` que estenda `OfferProvider` e implemente `fetchOffers()`.
2. Registrar uma instância dela em `services/offersService.js`.

Nenhum outro arquivo do app precisa ser alterado — o comparador, as categorias, a busca e a Lista de Rancho passam a usar a nova fonte automaticamente.

## Como rodar localmente

Como o app usa módulos ES (`import`/`export`), ele precisa ser servido por HTTP (não abra o `index.html` direto com `file://`).

```bash
# Opção 1: Python
python3 -m http.server 8080

# Opção 2: Node
npx serve .
```

Depois acesse `http://localhost:8080`.

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub e envie todo o conteúdo desta pasta:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão do Hora do Rancho"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/hora-do-rancho.git
   git push -u origin main
   ```
2. No repositório: **Settings → Pages → Branch: `main` / pasta `/ (root)` → Save**.
3. Em alguns minutos o app estará em `https://SEU_USUARIO.github.io/hora-do-rancho/`.
4. Em qualquer navegador (Android/iOS/Desktop), abra o link e use **"Adicionar à tela inicial"** / **"Instalar app"** — o PWA funciona como um aplicativo nativo, com ícone próprio e uso offline parcial.

## Evolução futura / empacotamento como Android

Por ser um PWA padrão (manifest + service worker), o projeto pode futuramente ser empacotado como `.apk`/`.aab` usando o [PWABuilder](https://www.pwabuilder.com/) (gratuito, oficial da Microsoft/Google) sem reescrever nenhuma linha de código.

## Licença

Veja [LICENSE](./LICENSE).
