#!/usr/bin/env python3
"""
scrape_vtex.py
Coleta preços reais e públicos de produtos nas redes configuradas em
config/redes.json, usando a API pública de busca da plataforma VTEX
(a mesma que a própria loja online de cada rede usa no navegador do
cliente — nenhuma autenticação, chave ou acesso privado é usado).

Roda como uma GitHub Action agendada (ver .github/workflows/scrape-ofertas.yml),
NUNCA dentro do navegador do usuário (evita CORS e mantém o app 100% estático).

Saída: assets/data/scraped-offers.json, no formato que o ScrapedFeedProvider
(services/offerProviders/ScrapedFeedProvider.js) já sabe consumir.
"""

import json
import time
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime, timedelta, timezone

ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = ROOT / "config" / "redes.json"
OUTPUT_PATH = ROOT / "assets" / "data" / "scraped-offers.json"

USER_AGENT = "HoraDoRanchoBot/1.0 (+coleta de precos publicos para comparacao; contato: ver README do projeto)"
REQUEST_DELAY_SECONDS = 1.5  # educado com o servidor da loja, evita sobrecarregar


def carregar_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def buscar_produtos_vtex(api_base, termo, limite=10):
    """Consulta a API pública VTEX de busca de produtos por termo."""
    termo_url = urllib.parse.quote(termo)
    url = f"{api_base}/api/catalog_system/pub/products/search/{termo_url}?_from=0&_to={limite - 1}"

    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            if response.status != 200:
                print(f"  [aviso] {api_base} '{termo}': status {response.status}")
                return []
            return json.loads(response.read().decode("utf-8"))
    except Exception as error:
        print(f"  [erro] {api_base} '{termo}': {error}")
        return []


def extrair_ofertas(produtos_vtex, categoria, rede_id, rede_nome):
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
        disponivel = oferta_comercial.get("IsAvailable", False)

        if not preco or preco <= 0 or not disponivel:
            continue

        ofertas.append({
            "nome": nome_produto,
            "marca": marca or None,
            "categoria": categoria,
            "preco": round(float(preco), 2),
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
    todas_ofertas = []

    for rede in config["redes"]:
        print(f"\n== Coletando: {rede['nomeExibicao']} ==")
        for categoria, termos in config["termosPorCategoria"].items():
            for termo in termos:
                print(f"  buscando '{termo}' ({categoria})...")
                produtos = buscar_produtos_vtex(rede["apiBase"], termo)
                ofertas = extrair_ofertas(produtos, categoria, rede["id"], rede["nomeExibicao"])
                todas_ofertas.extend(ofertas)
                time.sleep(REQUEST_DELAY_SECONDS)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(todas_ofertas, f, ensure_ascii=False, indent=2)

    print(f"\n✅ {len(todas_ofertas)} ofertas salvas em {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
