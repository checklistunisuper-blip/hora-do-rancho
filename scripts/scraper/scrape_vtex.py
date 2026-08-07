def main():
    config = carregar_config()
    mapa_categoria = config.get("mapaCategoriaPorPalavraChave", {})
    todas_ofertas = []

    for rede in config["redes"]:
        print(f"\n== Coletando: {rede['nomeExibicao']} ==")
        ofertas_rede = []

        try:
            # 1. Coleta VTEX (Apenas coleção real de promoções, ex: /ofertas)
            if rede.get("tipoColeta") == "vtex" or "apiBase" in rede:
                slug = rede.get("ofertasSlug")
                if slug:
                    print(f"  buscando coleção real VTEX ('{slug}')...")
                    produtos = buscar_colecao_ofertas(rede["apiBase"], slug)
                    ofertas_rede = extrair_ofertas_vtex(produtos, rede["id"], rede["nomeExibicao"], mapa_categoria)

            # 2. Coleta OCR (Apenas encartes reais em imagem)
            if (rede.get("ocr_habilitado") or rede.get("tipoColeta") == "ocr") and OCR_DISPONIVEL:
                url_encarte = rede.get("urlEncarte") or rede.get("site_ofertas")
                if url_encarte:
                    ofertas_ocr = extrair_ofertas_ocr(url_encarte, rede["id"], rede["nomeExibicao"], mapa_categoria)
                    ofertas_rede.extend(ofertas_ocr)

        except Exception as e:
            print(f"  [erro ao processar rede {rede['nomeExibicao']}]: {e}")

        print(f"  Total da rede {rede['nomeExibicao']}: {len(ofertas_rede)} ofertas reais.")
        todas_ofertas.extend(ofertas_rede)

    # Proteção: só atualiza o JSON se realmente encontrar promoções legítimas
    if len(todas_ofertas) > 0:
        OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(todas_ofertas, f, ensure_ascii=False, indent=2)
        print(f"\n✅ {len(todas_ofertas)} ofertas reais salvas em {OUTPUT_PATH}")
    else:
        print("\n⚠️ Nenhuma oferta real capturada nesta rodada. O arquivo anterior foi preservado.")
