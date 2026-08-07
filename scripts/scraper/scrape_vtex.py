#!/usr/bin/env python3
"""
scrape_vtex.py (agora com suporte a OCR)
Coleta as OFERTAS REAIS anunciadas publicamente pelas redes configuradas em
config/redes.json, combinando:
1) API pública VTEX (Zaffari, Carrefour, Stok Center, Rissul).
2) Leitura de Encartes e Mídias Sociais via OCR + Web Scraping (UniAtacadista, Asun, Macromix, etc.).

Saída: assets/data/scraped-offers.json, no formato consumido pelo PWA.
"""

import json
import re
import time
import unicodedata
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime, timedelta, timezone

# Bibliotecas para processamento de OCR e Imagens
import cv2
import numpy as np
import pytesseract
from PIL import Image
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = ROOT / "config" / "redes.json"
OUTPUT_PATH = ROOT / "assets" / "data" / "scraped-offers.json"
TEMP_DIR = ROOT / "assets" / "data" / "temp_encartes"

USER_AGENT = "HoraDoRanchoBot/1.0 (+coleta de ofertas publicas para comparacao; ver README do projeto)"
REQUEST_DELAY_SECONDS = 1.5
PRODUTOS_POR_PAGINA = 50
MAX_PAGINAS_POR_COLECAO = 6

# Regex para extração de preços e unidades dos encartes lidos por OCR
PADRAO_OFERTA_OCR = re.compile(
    r'(?P<produto>[A-Za-zÀ-ÿ0-9\s%\.\-]+?)\s+'
    r'(?:De\s*R\$\s*\d+[\.,]\d{2}\s*)?'
    r'(?:R\$\s*)?(?P<preco>\d+[\.,]\d{2})'
    r'(?:\s*\/\s*(?P<unidade>kg|g|un|L|ml|500g|pack))?',
    re.IGNORECASE
)


def carregar_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def normalizar(texto):
    texto = (texto or "").lower()
    texto = unicodedata.normalize("NFD", texto)
    return "".join(c for c in texto if unicodedata.category(c) != "Mn")


def requisitar(url, is_json=True):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json" if is_json else "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            if response.status != 200:
                print(f"  [aviso] status {response.status} em {url}")
                return None
            conteudo = response.read()
            return json.loads(conteudo.decode("utf-8")) if is_json else conteudo
    except Exception as error:
        print(f"  [erro] {url}: {error}")
        return None


# --- MOTOR VTEX ---

def buscar_colecao_ofertas(api_base, slug):
    todos_produtos = []
    for pagina in range(MAX_PAGINAS_POR_COLECAO):
        de = pagina * PRODUTOS_POR_PAGINA
        ate = de + PRODUTOS_POR_PAGINA - 1
        url = (
            f"{api_base}/api/catalog_system/pub/products/search/{slug}"
            f"?map=productclusternames&_from={de}&_to={ate}"
        )
        produtos = requisitar(url, is_json=True)
        if not produtos:
            break
        todos_produtos.extend(produtos)
        if len(produtos) < PRODUTOS_POR_PAGINA:
            break
        time.sleep(REQUEST_DELAY_SECONDS)
    return todos_produtos


def buscar_produtos_por_termo(api_base, termo, limite=10):
    termo_url = urllib.parse.quote(termo)
    url = f"{api_base}/api/catalog_system/pub/products/search/{termo_url}?_from=0&_to={limite - 1}"
    return requisitar(url, is_json=True) or []


def detectar_categoria(produto_nome, mapa_categoria_por_palavra):
    texto_busca = normalizar(produto_nome)
    for categoria_id, palavras in mapa_categoria_por_palavra.items():
        for palavra in palavras:
            if normalizar(palavra) in texto_busca:
                return categoria_id
    return "bazar"


def extrair_ofertas_vtex(produtos_vtex, rede_id, rede_nome, mapa_categoria_por_palavra, categoria_fixa=None):
    ofertas = []
    validade = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()

    for produto in produtos_vtex:
        nome_produto = produto.get("productName", "").strip()
        marca = produto.get("brand", "").strip()
        itens = produto.get("items", [])
        if not nome_produto or not itens:
            continue

        sku = itens[0]
        imagem = sku.get("images", [{}])[0].get("imageUrl") if sku.get("images") else None
        vendedores = sku.get("sellers", [])
        if not vendedores:
            continue

        oferta_comercial = vendedores[0].get("commertialOffer", {})
        preco = oferta_comercial.get("Price")
        preco_de = oferta_comercial.get("ListPrice")
        disponivel = oferta_comercial.get("IsAvailable", False)

        if not preco or preco <= 0 or not disponivel:
            continue

        categoria = categoria_fixa or detectar_categoria(nome_produto, mapa_categoria_por_palavra)

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
            "origem": "Loja Online (VTEX)",
            "ean": sku.get("ean"),
            "data": datetime.now(timezone.utc).isoformat(),
            "validade": validade,
        })

    return ofertas


# --- MOTOR OCR (ENCARTES / REDES SOCIAIS) ---

def processar_imagem_ocr(caminho_imagem):
    """Aplica binarização na imagem com OpenCV para aumentar a precisão do Tesseract."""
    try:
        img = cv2.imread(str(caminho_imagem))
        cinza = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Binarização adaptativa para destacar textos e preços
        _, limiar = cv2.threshold(cinza, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        texto = pytesseract.image_to_string(limiar, lang='por')
        return texto
    except Exception as e:
        print(f"  [erro ocr] falha ao processar {caminho_imagem}: {e}")
        return ""


def extrair_ofertas_ocr(url_pagina, rede_id, rede_nome, mapa_categoria):
    """Busca imagens de encarte na página da rede e aplica OCR."""
    print(f"  [OCR] buscando encartes em {url_pagina}...")
    html = requisitar(url_pagina, is_json=False)
    if not html:
        return []

    soup = BeautifulSoup(html, 'html.parser')
    # Procura por tag <img> contendo keywords de ofertas/encartes
    imagens_encarte = []
    for img in soup.find_all('img'):
        src = img.get('src') or img.get('data-src')
        if src and any(term in src.lower() for term in ['oferta', 'encarte', 'volante', 'banner', 'promocao']):
            if not src.startswith('http'):
                src = urllib.parse.urljoin(url_pagina, src)
            imagens_encarte.append(src)

    ofertas = []
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    validade = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()

    for idx, img_url in enumerate(imagens_encarte[:3]):  # Limite de 3 imagens por rede
        print(f"  [OCR] baixando encarte {idx+1}: {img_url}")
        img_data = requisitar(img_url, is_json=False)
        if not img_data:
            continue

        caminho_temp = TEMP_DIR / f"{rede_id}_{idx}.jpg"
        with open(caminho_temp, "wb") as f:
            f.write(img_data)

        texto_ocr = processar_imagem_ocr(caminho_temp)
        linhas = texto_ocr.split('\n')

        for i, linha in enumerate(linhas):
            match = PADRAO_OFERTA_OCR.search(linha)
            if match:
                produto_nome = match.group("produto").strip()
                preco_str = match.group("preco").replace(',', '.')
                unidade = match.group("unidade")

                if len(produto_nome) < 3 and i > 0:
                    produto_nome = linhas[i-1].strip()

                try:
                    preco = float(preco_str)
                    if preco > 0 and len(produto_nome) >= 3:
                        categoria = detectar_categoria(produto_nome, mapa_categoria)
                        ofertas.append({
                            "nome": produto_nome.title(),
                            "marca": None,
                            "categoria": categoria,
                            "preco": round(preco, 2),
                            "precoOriginal": None,
                            "unidade": unidade or "un",
                            "imagem": img_url,
                            "redeId": rede_id,
                            "redeNome": rede_nome,
                            "origem": "Encarte Digital (OCR)",
                            "data": datetime.now(timezone.utc).isoformat(),
                            "validade": validade,
                        })
                except ValueError:
                    continue

    return ofertas


# --- EXECUTOR PRINCIPAL ---

def main():
    config = carregar_config()
    mapa_categoria = config.get("mapaCategoriaPorPalavraChave", {})
    todas_ofertas = []

    for rede in config["redes"]:
        print(f"\n== Coletando: {rede['nomeExibicao']} ==")
        ofertas_rede = []

        # 1. Coleta via VTEX
        if rede.get("tipoColeta") == "vtex" or "apiBase" in rede:
            slug = rede.get("ofertasSlug")
            if slug:
                print(f"  buscando coleção real VTEX ('{slug}')...")
                produtos = buscar_colecao_ofertas(rede["apiBase"], slug)
                ofertas_rede = extrair_ofertas_vtex(produtos, rede["id"], rede["nomeExibicao"], mapa_categoria)

            if not ofertas_rede and config.get("termosPorCategoria"):
                print("  usando busca por termo (reserva VTEX)...")
                for categoria, termos in config.get("termosPorCategoria", {}).items():
                    for termo in termos:
                        produtos = buscar_produtos_por_termo(rede["apiBase"], termo)
                        ofertas_rede.extend(
                            extrair_ofertas_vtex(produtos, rede["id"], rede["nomeExibicao"], mapa_categoria, categoria_fixa=categoria)
                        )
                        time.sleep(REQUEST_DELAY_SECONDS)

        # 2. Coleta via OCR (Encartes e Redes Sociais)
        if rede.get("ocr_habilitado") or rede.get("tipoColeta") == "ocr":
            url_encarte = rede.get("urlEncarte") or rede.get("site_ofertas")
            if url_encarte:
                ofertas_ocr = extrair_ofertas_ocr(url_encarte, rede["id"], rede["nomeExibicao"], mapa_categoria)
                ofertas_rede.extend(ofertas_ocr)

        print(f"  Total da rede {rede['nomeExibicao']}: {len(ofertas_rede)} ofertas.")
        todas_ofertas.extend(ofertas_rede)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(todas_ofertas, f, ensure_ascii=False, indent=2)

    print(f"\n✅ {len(todas_ofertas)} ofertas totais salvas em {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
