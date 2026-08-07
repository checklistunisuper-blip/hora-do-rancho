#!/usr/bin/env python3
"""
scrape_vtex.py
Coleta as OFERTAS REAIS anunciadas publicamente pelas redes configuradas em
config/redes.json, usando a API pública da plataforma VTEX (a mesma que a
loja online de cada rede usa no navegador do cliente — nenhuma autenticação,
chave ou acesso privado é usado).

Prioridade da coleta:
1) Coleção real de ofertas da rede (ex: zaffari.com.br/ofertas), consultada
   via "?map=productclusternames" — são exatamente os produtos que a rede
   está anunciando em promoção agora, não uma busca genérica.
2) Se a rede não tiver essa coleção configurada/disponível, cai para busca
   por termo comum (config: termosPorCategoria) só como reserva.

Roda como uma GitHub Action agendada (ver .github/workflows/scrape-ofertas.yml),
NUNCA dentro do navegador do usuário (evita CORS e mantém o app 100% estático).

Saída: assets/data/scraped-offers.json, no formato que o ScrapedFeedProvider
(services/offerProviders/ScrapedFeedProvider.js) já sabe consumir.
"""

import json
import time
import unicodedata
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime, timedelta, timezone

ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = ROOT / "config" / "redes.json"
OUTPUT_PATH = ROOT / "assets" / "data" / "scraped-offers.json"

USER_AGENT = "HoraDoRanchoBot/1.0 (+coleta de ofertas publicas para comparacao; ver README do projeto)"
REQUEST_DELAY_SECONDS = 1.5  # educado com o servidor da loja
PRODUTOS_POR_PAGINA = 50     # limite confortável da API VTEX
MAX_PAGINAS_POR_COLECAO = 6  # trava de segurança (até ~300 produtos por rede)


def carregar_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def normalizar(texto):
    texto = (texto or "").lower()
    texto = unicodedata.normalize("NFD", texto)
    return "".join(c for c in texto if unicodedata.category(c) != "Mn")


def requisitar_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            if response.status != 200:
                print(f"  [aviso] status {response.status} em {url}")
                return None
            return json.loads(response.read().decode("utf-8"))
    except Exception as error:
        print(f"  [erro] {url}: {error}")
        return None


def buscar_colecao_ofertas(api_base, slug):
    """Busca TODOS os produtos da coleção real de ofertas da rede (paginado)."""
    todos_produtos = []
    for pagina in range(MAX_PAGINAS_POR_COLECAO):
        de = pagina * PRODUTOS_POR_PAGINA
        ate = de + PRODUTOS_POR_PAGINA - 1
        url = (
            f"{api_base}/api/catalog_system/pub/products/search/{slug}"
            f"?map=productclusternames&_from={de}&_to={ate}"
        )
        produtos = requisitar_json(url)
        if not produtos:
            break
        todos_produtos.extend(produtos)
        if len(produtos) < PRODUTOS_POR_PAGINA:
            break  # última página
        time.sleep(REQUEST_DELAY_SECONDS)
    return todos_produtos


def buscar_produtos_por_termo(api_base, termo, limite=10):
    """Reserva: busca por termo comum quando a rede não tem coleção de ofertas configurada."""
    termo_url = urllib.parse.quote(termo)
    url = f"{api_base}/api/catalog_system/pub/products/search/{termo_url}?_from=0&_to={limite - 1}"
    return requisitar_json(url) or []


def detectar_categoria(produto, mapa_categoria_por_palavra):
    """Detecta a categoria do app a partir do nome/categoria do produto na VTEX."""
    texto_busca = normalizar(
        produto.get("productName", "") + " " + " ".join(produto.get("categories", []))
    )
    for categoria_id, palavras in mapa_categoria_por_palavra.items():
        for palavra in palavras:
            if normalizar(palavra) in texto_busca:
                return categoria_id
    return "bazar"  # categoria genérica de reserva, quando não identifica


def extrair_ofertas(produtos_vtex, rede_id, rede_nome, mapa_categoria_por_palavra, categoria_fixa=None):
    """Converte a resposta bruta da VTEX no formato padrão do app."""
    ofertas = []
    validade = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()

    for produto in produtos_vtex:
        nome_produto = produto.get("productName", "").strip()
        marca = produto.get("brand", "").strip()
        itens = produto.get("items", [])
        if not nome_produto or not itens:
            continue

        sku = itens[0]
        imagem = None
        if sku.get("images"):
            imagem = sku["images"][0].get("imageUrl")

        vendedores = sku.get("sellers", [])
        if not vendedores:
            continue

        oferta_comercial = vendedores[0].get("commertialOffer", {})
        preco = oferta_comercial.get("Price")
        preco_de = oferta_comercial.get("ListPrice")
        disponivel = oferta_comercial.get("IsAvailable", False)

        if not preco or preco <= 0 or not disponivel:
            continue

        categoria = categoria_fixa or detectar_categoria(produto, mapa_categoria_por_palavra)

        ofertas.append({
            "nome": nome_produto,
            "marca": marca or None,
            "categoria": categoria,
            "preco": round(float(preco), 2),
            "precoOriginal": round(float(preco_de), 2) if preco_de and preco_de > preco else None,
            "unidade": sku.get("unitMultiplier") and f"{sku['unitMultiplier']} un" or None,
            "imagem": imagem,
            "redeId": rede_id,
            "redeNome": rede_nome,
            "ean": sku.get("ean"),
            "data": datetime.now(timezone.utc).isoformat(),
            "validade": validade,
        })

    return ofertas


def main():
    config = carregar_config()
    mapa_categoria = config.get("mapaCategoriaPorPalavraChave", {})
    todas_ofertas = []

    for rede in config["redes"]:
        print(f"\n== Coletando: {rede['nomeExibicao']} ==")
        ofertas_rede = []

        slug = rede.get("ofertasSlug")
        if slug:
            print(f"  buscando coleção real de ofertas ('{slug}')...")
            produtos = buscar_colecao_ofertas(rede["apiBase"], slug)
            ofertas_rede = extrair_ofertas(produtos, rede["id"], rede["nomeExibicao"], mapa_categoria)
            print(f"  {len(ofertas_rede)} ofertas encontradas na coleção real.")

        if not ofertas_rede:
            print("  coleção de ofertas vazia ou indisponível, usando busca por termo como reserva...")
            for categoria, termos in config.get("termosPorCategoria", {}).items():
                for termo in termos:
                    produtos = buscar_produtos_por_termo(rede["apiBase"], termo)
                    ofertas_rede.extend(
                        extrair_ofertas(produtos, rede["id"], rede["nomeExibicao"], mapa_categoria, categoria_fixa=categoria)
                    )
                    time.sleep(REQUEST_DELAY_SECONDS)

        todas_ofertas.extend(ofertas_rede)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(todas_ofertas, f, ensure_ascii=False, indent=2)

    print(f"\n✅ {len(todas_ofertas)} ofertas reais salvas em {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
