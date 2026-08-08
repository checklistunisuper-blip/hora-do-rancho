  /**
 * Markets Service
 * Fornece a lista de supermercados e métodos utilitários de filtragem e localização.
 */

const MARKETS_DATA = [
  {
    "id": 1,
    "network": "Companhia Zaffari",
    "name": "Hipermercado Zaffari Higienópolis",
    "address": "Av. Plínio Brasil Milano, 1000 - Higienópolis, Porto Alegre - RS, 90520-000",
    "city": "Porto Alegre",
    "phone": "4004-1112",
    "lat": -30.0203,
    "lng": -51.1807
  },
  {
    "id": 2,
    "network": "Companhia Zaffari",
    "name": "Hipermercado Zaffari Ipiranga",
    "address": "Av. Ipiranga, 3000 - Santa Cecília, Porto Alegre - RS, 90160-092",
    "city": "Porto Alegre",
    "phone": "4004-1112",
    "lat": -30.0445,
    "lng": -51.1983
  },
  {
    "id": 3,
    "network": "Companhia Zaffari",
    "name": "Hipermercado Zaffari Centerlar",
    "address": "Av. Sertório, 8000 - Sarandi, Porto Alegre - RS, 91130-720",
    "city": "Porto Alegre",
    "phone": "4004-1112",
    "lat": -29.9997,
    "lng": -51.1311
  },
  {
    "id": 4,
    "network": "Companhia Zaffari",
    "name": "Hipermercado Zaffari Wallig (Bourbon Wallig)",
    "address": "Av. Assis Brasil, 2611 - Cristo Redentor, Porto Alegre - RS, 91010-006",
    "city": "Porto Alegre",
    "phone": "4004-1112",
    "lat": -30.0121,
    "lng": -51.1606
  },
  {
    "id": 5,
    "network": "Companhia Zaffari",
    "name": "Zaffari Protásio Alves",
    "address": "Av. Protásio Alves, 2700 - Petrópolis, Porto Alegre - RS, 90410-006",
    "city": "Porto Alegre",
    "phone": "4004-1112",
    "lat": -30.0431,
    "lng": -51.1823
  },
  {
    "id": 6,
    "network": "Companhia Zaffari",
    "name": "Zaffari Moinhos (Bourbon Moinhos)",
    "address": "R. Olávo Barreto Viana, 18 - Moinhos de Vento, Porto Alegre - RS, 90570-070",
    "city": "Porto Alegre",
    "phone": "51 4004-1112",
    "lat": -30.0235,
    "lng": -51.2015
  },
  {
    "id": 7,
    "network": "Companhia Zaffari",
    "name": "Zaffari Fernando Machado",
    "address": "R. Cel. Fernando Machado, 860 - Centro Histórico, Porto Alegre - RS, 90010-320",
    "city": "Porto Alegre",
    "phone": "4004-1112",
    "lat": -30.0348,
    "lng": -51.2289
  },
  {
    "id": 8,
    "network": "Companhia Zaffari",
    "name": "Zaffari Marechal Floriano",
    "address": "R. Mal. Floriano Peixoto, 333 - Centro Histórico, Porto Alegre - RS, 90020-060",
    "city": "Porto Alegre",
    "phone": "4004-1112",
    "lat": -30.0316,
    "lng": -51.2271
  },
  {
    "id": 9,
    "network": "Companhia Zaffari",
    "name": "Zaffari Lucas de Oliveira",
    "address": "Av. Cel. Lucas de Oliveira, 740 - Bela Vista, Porto Alegre - RS, 90440-010",
    "city": "Porto Alegre",
    "phone": "4004-1112",
    "lat": -30.0293,
    "lng": -51.1941
  },
  {
    "id": 10,
    "network": "Companhia Zaffari",
    "name": "Bourbon Hypermarket (Ipiranga)",
    "address": "Av. Ipiranga, 5200 - Jardim Botânico, Porto Alegre - RS, 90610-000",
    "city": "Porto Alegre",
    "phone": "4004-1112",
    "lat": -30.0551,
    "lng": -51.1869
  },
  {
    "id": 11,
    "network": "Companhia Zaffari",
    "name": "Bourbon Country Hypermarket",
    "address": "Av. Túlio de Rose, 100 - Jardim Europa, Porto Alegre - RS, 91340-110",
    "city": "Porto Alegre",
    "phone": "4004-1112",
    "lat": -30.022,
    "lng": -51.1622
  },
  {
    "id": 12,
    "network": "Companhia Zaffari",
    "name": "Bourbon Hipermercado Assis Brasil",
    "address": "Av. Assis Brasil, 164 - São João, Porto Alegre - RS, 91010-001",
    "city": "Porto Alegre",
    "phone": "4004-1112",
    "lat": -30.0062,
    "lng": -51.1842
  },
  {
    "id": 13,
    "network": "Companhia Zaffari",
    "name": "Zaffari Otto Niemeyer",
    "address": "Av. Otto Niemeyer, 601 - Tristeza, Porto Alegre - RS, 91910-001",
    "city": "Porto Alegre",
    "phone": "4004-1112",
    "lat": -30.1104,
    "lng": -51.2527
  },
  {
    "id": 14,
    "network": "Comercial Zaffari",
    "name": "Comercial Zaffari - Passo Fundo Shopping",
    "address": "Av. Pres. Vargas, 1610 - São Cristovão, Passo Fundo - RS, 99070-000",
    "city": "Passo Fundo",
    "phone": "54 3310-1256",
    "lat": -28.2713,
    "lng": -52.3862
  },
  {
    "id": 15,
    "network": "Comercial Zaffari",
    "name": "Comercial Zaffari - Bella Città",
    "address": "Av. 7 de Setembro, 395 - Centro, Passo Fundo - RS, 99010-121",
    "city": "Passo Fundo",
    "phone": "54 3311-4571",
    "lat": -28.2627,
    "lng": -52.4098
  },
  {
    "id": 16,
    "network": "Comercial Zaffari",
    "name": "Comercial Zaffari - Av. Brasil",
    "address": "Av. Brasil Leste, 501 - Loja 2 - Centro, Passo Fundo - RS, 99010-000",
    "city": "Passo Fundo",
    "phone": "54 3313-1604",
    "lat": -28.2564,
    "lng": -52.3991
  },
  {
    "id": 17,
    "network": "Comercial Zaffari",
    "name": "Comercial Zaffari - Vergueiro",
    "address": "R. Fagundes dos Reis / R. Carolina Vergueiro, 1200 - Vila Nicolau Vergueiro, Passo Fundo - RS, 99100-070",
    "city": "Passo Fundo",
    "phone": "54 3313-3722",
    "lat": -28.254,
    "lng": -52.4081
  },
  {
    "id": 18,
    "network": "Comercial Zaffari",
    "name": "Zaffari Passo Fundo (R. Uruguai)",
    "address": "R. Uruguai, 1483 - Vila Vergueiro, Passo Fundo - RS, 96010-112",
    "city": "Passo Fundo",
    "phone": "4004-1112",
    "lat": -28.2596,
    "lng": -52.4122
  },
  {
    "id": 19,
    "network": "Comercial Zaffari",
    "name": "Comercial Zaffari (R. Cel. Pelegrini)",
    "address": "R. Cel. Pelegrini, 405 - Vila Rodrigues, Passo Fundo - RS, 99070-010",
    "city": "Passo Fundo",
    "phone": "54 3313-2751",
    "lat": -28.2637,
    "lng": -52.3964
  },
  {
    "id": 20,
    "network": "Comercial Zaffari",
    "name": "Comercial Zaffari Santa Cruz do Sul",
    "address": "Av. Imigrante, 500 - Centro, Santa Cruz do Sul - RS, 96820-030",
    "city": "Santa Cruz do Sul",
    "phone": "51 3711-2200",
    "lat": -29.7072,
    "lng": -52.4286
  },
  {
    "id": 21,
    "network": "Comercial Zaffari",
    "name": "Comercial Zaffari Cruz Alta",
    "address": "R. Voluntários da Pátria, 550 - Sl 223 - Centro, Cruz Alta - RS, 98025-770",
    "city": "Cruz Alta",
    "phone": "55 3324-5341",
    "lat": -28.6395,
    "lng": -53.6023
  },
  {
    "id": 22,
    "network": "Comercial Zaffari",
    "name": "Centro Administrativo Comercial Zaffari",
    "address": "Av. Pres. Vargas, 3800 - Vila Exposição, Passo Fundo - RS, 99064-000",
    "city": "Passo Fundo",
    "phone": "54 3198-1300",
    "lat": -28.2829,
    "lng": -52.3722
  },
  {
    "id": 23,
    "network": "Unidasul (Rissul)",
    "name": "Rissul Gramado",
    "address": "Av. Borges de Medeiros, 3994 - Centro, Gramado - RS, 95670-000",
    "city": "Gramado",
    "phone": "54 3286-4211",
    "lat": -29.3681,
    "lng": -50.878
  },
  {
    "id": 24,
    "network": "Unidasul (Rissul)",
    "name": "Rissul Otto Mall",
    "address": "R. Sílvio Silveira Soares, 2357 - Loja 14 - Camaquã, Porto Alegre - RS, 91910-460",
    "city": "Porto Alegre",
    "phone": "51 2700-9591",
    "lat": -30.1016,
    "lng": -51.2347
  },
  {
    "id": 25,
    "network": "Unidasul (Rissul)",
    "name": "Rissul Novo Hamburgo (Nações Unidas)",
    "address": "Av. Nações Unidas, 334 - Operário, Novo Hamburgo - RS, 93310-500",
    "city": "Novo Hamburgo",
    "phone": "51 3594-7408",
    "lat": -29.6736,
    "lng": -51.1375
  },
  {
    "id": 26,
    "network": "Unidasul (Rissul)",
    "name": "Rissul Portão",
    "address": "Av. Brasil, 140 - Centro, Portão - RS, 93180-000",
    "city": "Portão",
    "phone": "51 3562-1733",
    "lat": -29.6939,
    "lng": -51.2321
  },
  {
    "id": 27,
    "network": "Unidasul (Rissul)",
    "name": "Rissul São Pedro (Navegantes)",
    "address": "Av. São Pedro, 512 - Navegantes, Porto Alegre - RS, 90230-002",
    "city": "Porto Alegre",
    "phone": "51 3337-4751",
    "lat": -30.0095,
    "lng": -51.2042
  },
  {
    "id": 28,
    "network": "Unidasul (Rissul)",
    "name": "Rissul Taquara",
    "address": "R. Júlio de Castilhos, 2710 - Centro, Taquara - RS, 95600-000",
    "city": "Taquara",
    "phone": "51 3542-4344",
    "lat": -29.6477,
    "lng": -50.7805
  },
  {
    "id": 29,
    "network": "Unidasul (Rissul)",
    "name": "Rissul Floresta (Cristóvão Colombo)",
    "address": "Av. Cristóvão Colombo, 1980 - Floresta, Porto Alegre - RS, 90560-002",
    "city": "Porto Alegre",
    "phone": "51 3395-1317",
    "lat": -30.0179,
    "lng": -51.2012
  },
  {
    "id": 30,
    "network": "Unidasul (Rissul)",
    "name": "Rissul Canoas (Santos Ferreira)",
    "address": "Av. Santos Ferreira, 2620 - Mal. Rondon, Canoas - RS, 92025-728",
    "city": "Canoas",
    "phone": "51 3075-9590",
    "lat": -29.9277,
    "lng": -51.1555
  },
  {
    "id": 31,
    "network": "Unidasul (Rissul)",
    "name": "Rissul Canoas (Venâncio Aires)",
    "address": "R. Venâncio Aires, 2800 - Niterói, Canoas - RS, 92110-001",
    "city": "Canoas",
    "phone": "51 3103-8816",
    "lat": -29.9371,
    "lng": -51.1755
  },
  {
    "id": 32,
    "network": "Unidasul (Rissul)",
    "name": "Rissul Novo Hamburgo (Bento Gonçalves)",
    "address": "R. Bento Gonçalves, 480 - Pátria Nova, Novo Hamburgo - RS",
    "city": "Novo Hamburgo",
    "phone": "51 2640-0031",
    "lat": -29.702,
    "lng": -51.1278
  },
  {
    "id": 33,
    "network": "Unidasul (Macromix)",
    "name": "Macromix Cachoeirinha",
    "address": "Av. Frederico Augusto Ritter, 320 - COHAB, Cachoeirinha - RS, 94930-075",
    "city": "Cachoeirinha",
    "phone": null,
    "lat": -29.9489,
    "lng": -51.1041
  },
  {
    "id": 34,
    "network": "Unidasul (Macromix)",
    "name": "Macromix Canoas (Liberdade)",
    "address": "R. Liberdade, 1381 - Mal. Rondon, Canoas - RS, 92020-240",
    "city": "Canoas",
    "phone": "51 3478-1098",
    "lat": -29.905,
    "lng": -51.1696
  },
  {
    "id": 35,
    "network": "Unidasul (Macromix)",
    "name": "Macromix Esteio",
    "address": "Av. Pres. Vargas, 880 - Centro, Esteio - RS, 93260-001",
    "city": "Esteio",
    "phone": "51 3473-3550",
    "lat": -29.8396,
    "lng": -51.1709
  },
  {
    "id": 36,
    "network": "Unidasul (Macromix)",
    "name": "Macromix Sapucaia do Sul",
    "address": "Av. Cel. Theodomiro Porto da Fonseca, 1365 - Pasqualini, Sapucaia do Sul - RS, 93224-665",
    "city": "Sapucaia do Sul",
    "phone": "51 3458-5530",
    "lat": -29.8413,
    "lng": -51.1355
  },
  {
    "id": 37,
    "network": "Unidasul (Macromix)",
    "name": "Macromix Taquara",
    "address": "Av. Oscar Martins Rangel, 3464 - Jardim do Prado, Taquara - RS, 95600-562",
    "city": "Taquara",
    "phone": "51 3103-8831",
    "lat": -29.6504,
    "lng": -50.7955
  },
  {
    "id": 38,
    "network": "Unidasul (Macromix)",
    "name": "Macromix Portão",
    "address": "RS-240, 3930 - Centro, Portão - RS, 93180-000",
    "city": "Portão",
    "phone": "51 3458-9768",
    "lat": -29.6899,
    "lng": -51.233
  },
  {
    "id": 39,
    "network": "Unidasul (Macromix)",
    "name": "Macromix Novo Hamburgo (Canudos)",
    "address": "Estr. Ver. Oscar Horn, 1315 - Canudos, Novo Hamburgo - RS, 93544-000",
    "city": "Novo Hamburgo",
    "phone": "51 3595-2860",
    "lat": -29.693,
    "lng": -51.0892
  },
  {
    "id": 40,
    "network": "Unidasul (Macromix)",
    "name": "Macromix São Leopoldo (Theodomiro Porto da Fonseca)",
    "address": "Av. Theodomiro Porto da Fonseca, 2120 - Padre Reus, São Leopoldo - RS, 93020-174",
    "city": "São Leopoldo",
    "phone": "51 3458-9736",
    "lat": -29.7874,
    "lng": -51.1445
  },
  {
    "id": 41,
    "network": "Unidasul (Macromix)",
    "name": "Macromix Santo Antônio da Patrulha",
    "address": "R. Cap. José Machado da Silva, 67 - Menino Deus, Santo Antônio da Patrulha - RS, 95500-000",
    "city": "Santo Antônio da Patrulha",
    "phone": null,
    "lat": -29.8371,
    "lng": -50.5295
  },
  {
    "id": 42,
    "network": "Unidasul (Macromix)",
    "name": "Macromix São Leopoldo (João Corrêa)",
    "address": "Av. João Corrêa, 1827 - Centro, São Leopoldo - RS, 93020-190",
    "city": "São Leopoldo",
    "phone": "51 3566-3388",
    "lat": -29.7721,
    "lng": -51.1531
  },
  {
    "id": 43,
    "network": "Imec",
    "name": "Imec Farroupilha",
    "address": "R. Pinheiro Machado, 535 - Centro, Farroupilha - RS, 95170-432",
    "city": "Farroupilha",
    "phone": "54 3261-2983",
    "lat": -29.2247,
    "lng": -51.3461
  },
  {
    "id": 44,
    "network": "Imec",
    "name": "Imec Lajeado (Montanha)",
    "address": "R. Irmando Weissheimer, 100 - Montanha, Lajeado - RS, 95900-000",
    "city": "Lajeado",
    "phone": "51 3714-1732",
    "lat": -29.4503,
    "lng": -51.9807
  },
  {
    "id": 45,
    "network": "Imec",
    "name": "Imec Lajeado (Centro)",
    "address": "R. Júlio de Castilhos, 1157 - Centro, Lajeado - RS, 95900-000",
    "city": "Lajeado",
    "phone": "51 3710-1711",
    "lat": -29.4606,
    "lng": -51.9667
  },
  {
    "id": 46,
    "network": "Imec",
    "name": "Imec Santa Cruz do Sul",
    "address": "R. Borges de Medeiros, 950 - Centro, Santa Cruz do Sul - RS, 96810-034",
    "city": "Santa Cruz do Sul",
    "phone": "51 3713-2693",
    "lat": -29.7147,
    "lng": -52.433
  },
  {
    "id": 47,
    "network": "Imec",
    "name": "Imec Rio Pardo",
    "address": "R. Andrade Neves, 210 - Centro, Rio Pardo - RS, 96640-000",
    "city": "Rio Pardo",
    "phone": "51 3731-1945",
    "lat": -29.9862,
    "lng": -52.38
  },
  {
    "id": 48,
    "network": "Imec",
    "name": "Imec Venâncio Aires",
    "address": "R. Júlio de Castilhos, 1111 - Centro, Venâncio Aires - RS, 95800-000",
    "city": "Venâncio Aires",
    "phone": "51 3741-3388",
    "lat": -29.6095,
    "lng": -52.1943
  },
  {
    "id": 49,
    "network": "Imec",
    "name": "Imec Vacaria",
    "address": "R. Mal. Floriano, 79 - Centro, Vacaria - RS, 95200-000",
    "city": "Vacaria",
    "phone": "54 3232-1788",
    "lat": -28.5016,
    "lng": -50.9368
  },
  {
    "id": 50,
    "network": "Imec",
    "name": "Imec Cachoeira do Sul",
    "address": "Av. Júlio de Castilhos, 11 - Centro, Cachoeira do Sul - RS, 96501-001",
    "city": "Cachoeira do Sul",
    "phone": "51 3723-6633",
    "lat": -30.0414,
    "lng": -52.8978
  },
  {
    "id": 51,
    "network": "Imec",
    "name": "Imec Montenegro",
    "address": "R. Cap. Cruz, 2030 - Centro, Montenegro - RS, 95780-000",
    "city": "Montenegro",
    "phone": "51 3649-2050",
    "lat": -29.6852,
    "lng": -51.4597
  },
  {
    "id": 52,
    "network": "Imec",
    "name": "Centro de Distribuição Imec",
    "address": "RS-130, 3880 - Moinhos, Lajeado - RS, 95901-150",
    "city": "Lajeado",
    "phone": "51 3714-8100",
    "lat": -29.4535,
    "lng": -51.9811
  },
  {
    "id": 53,
    "network": "Asun",
    "name": "Asun Cachoeirinha Centro",
    "address": "Av. Gen. Flores da Cunha, 952 - Centro, Cachoeirinha - RS, 94910-001",
    "city": "Cachoeirinha",
    "phone": "51 2129-0999",
    "lat": -29.9529,
    "lng": -51.104
  },
  {
    "id": 54,
    "network": "Asun",
    "name": "Asun Xangri-lá 1",
    "address": "R. Pedro Higino da Silveira, 1041 - Centro, Xangri-lá - RS, 95588-000",
    "city": "Xangri-lá",
    "phone": "51 2129-0999",
    "lat": -29.8017,
    "lng": -50.0458
  },
  {
    "id": 55,
    "network": "Asun",
    "name": "Asun Eldorado do Sul",
    "address": "Estr. da Arrozeira, 10 - Centro, Eldorado do Sul - RS, 92990-000",
    "city": "Eldorado do Sul",
    "phone": "51 2129-0999",
    "lat": -30.0037,
    "lng": -51.3121
  },
  {
    "id": 56,
    "network": "Asun",
    "name": "Asun Osório",
    "address": "R. Lateral BR-101 - Centro, Osório - RS, 95520-000",
    "city": "Osório",
    "phone": "51 2129-0999",
    "lat": -29.885,
    "lng": -50.2701
  },
  {
    "id": 57,
    "network": "Asun",
    "name": "Asun Balneário Pinhal",
    "address": "Av. Pampa, 400 - Balneário Pinhal - RS, 95599-000",
    "city": "Balneário Pinhal",
    "phone": "51 2129-0999",
    "lat": -30.2523,
    "lng": -50.2364
  },
  {
    "id": 58,
    "network": "Asun",
    "name": "Asun Igara (Canoas)",
    "address": "Av. Boqueirão, 2100 - Igara, Canoas - RS, 92032-420",
    "city": "Canoas",
    "phone": "51 2129-0999",
    "lat": -29.9044,
    "lng": -51.1528
  },
  {
    "id": 59,
    "network": "Asun",
    "name": "Asun Noiva do Mar (Xangri-lá)",
    "address": "Av. Paraguassu, 801 - Centro, Xangri-lá - RS, 95588-000",
    "city": "Xangri-lá",
    "phone": "51 2129-0999",
    "lat": -29.8392,
    "lng": -50.0594
  },
  {
    "id": 60,
    "network": "Asun",
    "name": "Asun Torres",
    "address": "Av. Castelo Branco, 1010 - Centro, Torres - RS, 95560-000",
    "city": "Torres",
    "phone": "51 2129-0999",
    "lat": -29.3299,
    "lng": -49.7466
  },
  {
    "id": 61,
    "network": "Asun",
    "name": "Asun Canoas (Cairú)",
    "address": "R. Cairú, 1880 - Rio Branco, Canoas - RS, 92200-021",
    "city": "Canoas",
    "phone": "51 2129-0999",
    "lat": -29.9452,
    "lng": -51.1834
  },
  {
    "id": 62,
    "network": "Asun",
    "name": "Asun Tramandaí",
    "address": "Av. Fernandes Bastos, 1201 - Centro, Tramandaí - RS, 95590-000",
    "city": "Tramandaí",
    "phone": "51 2129-0999",
    "lat": -29.9909,
    "lng": -50.1423
  },
  {
    "id": 63,
    "network": "Master ATS",
    "name": "Master Supermercados - Av. Sete",
    "address": "Av. Sete de Setembro, 1200 - Fátima, Erechim - RS, 99709-920",
    "city": "Erechim",
    "phone": "54 3520-1900",
    "lat": -27.6452,
    "lng": -52.2674
  },
  {
    "id": 64,
    "network": "Master ATS",
    "name": "Master Supermercados - R. Torres Gonçalves",
    "address": "R. Tôrres Gonçalves, 122 - Centro, Erechim - RS, 99700-000",
    "city": "Erechim",
    "phone": "54 3321-1366",
    "lat": -27.6313,
    "lng": -52.274
  },
  {
    "id": 65,
    "network": "Peruzzo",
    "name": "Peruzzo Tupi Silveira 1501",
    "address": "Av. Tupi Silveira, 1501 - Centro, Bagé - RS, 96400-110",
    "city": "Bagé",
    "phone": "53 3242-8100",
    "lat": -31.3234,
    "lng": -54.1064
  },
  {
    "id": 66,
    "network": "Peruzzo",
    "name": "Peruzzo Bento Gonçalves",
    "address": "R. Bento Gonçalves, 369 - Centro, Bagé - RS, 96400-201",
    "city": "Bagé",
    "phone": "53 3247-6070",
    "lat": -31.3287,
    "lng": -54.1002
  },
  {
    "id": 67,
    "network": "Peruzzo",
    "name": "Peruzzo Tupi Silveira 1887",
    "address": "Av. Tupi Silveira, 1887 - Sl 01 - Centro, Bagé - RS, 96400-110",
    "city": "Bagé",
    "phone": "53 3241-7425",
    "lat": -31.3181,
    "lng": -54.1072
  },
  {
    "id": 68,
    "network": "Peruzzo",
    "name": "Peruzzo General Teles",
    "address": "R. Gen. João Téles, 645 - Centro, Bagé - RS, 96400-030",
    "city": "Bagé",
    "phone": "53 3240-8800",
    "lat": -31.3346,
    "lng": -54.1002
  },
  {
    "id": 69,
    "network": "Peruzzo",
    "name": "Peruzzo Getúlio Vargas",
    "address": "Av. Santa Tecla, 1199 - Getúlio Vargas, Bagé - RS, 96412-000",
    "city": "Bagé",
    "phone": "53 3241-2011",
    "lat": -31.3123,
    "lng": -54.0897
  },
  {
    "id": 70,
    "network": "Peruzzo",
    "name": "Peruzzo Avenida Espanha",
    "address": "Av. Espanha, 1010 - Popular, Bagé - RS, 96408-000",
    "city": "Bagé",
    "phone": "53 3241-3688",
    "lat": -31.3063,
    "lng": -54.118
  },
  {
    "id": 71,
    "network": "Guanabara",
    "name": "Guanabara Hiper (Rio Grande)",
    "address": "R. Dr. Napoleão Laureano, 517 - Centro, Rio Grande - RS, 96200-100",
    "city": "Rio Grande",
    "phone": "53 2125-2202",
    "lat": -32.0396,
    "lng": -52.0939
  },
  {
    "id": 72,
    "network": "Guanabara",
    "name": "Guanabara Cassino",
    "address": "Av. Rio Grande, 79 - Rio Grande - RS, 96207-000",
    "city": "Rio Grande",
    "phone": "53 2125-2206",
    "lat": -32.1847,
    "lng": -52.1593
  },
  {
    "id": 73,
    "network": "Guanabara",
    "name": "Guanabara Shopping",
    "address": "R. Jockey Clube, 155 - Vila Prado, Rio Grande - RS, 96212-730",
    "city": "Rio Grande",
    "phone": "53 2125-2211",
    "lat": -32.0525,
    "lng": -52.1497
  },
  {
    "id": 74,
    "network": "Guanabara",
    "name": "Guanabara Pelotas (Largo Portugal)",
    "address": "Largo Portugal, 1155 - Centro, Pelotas - RS, 96010-340",
    "city": "Pelotas",
    "phone": "53 2125-2222",
    "lat": -31.7715,
    "lng": -52.3503
  },
  {
    "id": 75,
    "network": "Guanabara",
    "name": "Guanabara Osório (R. Gen. Osório)",
    "address": "R. Gen. Osório, 595 - Centro, Rio Grande - RS, 96200-400",
    "city": "Rio Grande",
    "phone": "53 2125-2201",
    "lat": -32.0303,
    "lng": -52.1016
  },
  {
    "id": 76,
    "network": "Guanabara",
    "name": "Guanabara Teixeira",
    "address": "R. Conselheiro Teixeira Júnior, 504 - Cidade Nova, Rio Grande - RS, 96211-540",
    "city": "Rio Grande",
    "phone": "53 2125-2203",
    "lat": -32.041,
    "lng": -52.1118
  },
  {
    "id": 77,
    "network": "Guanabara",
    "name": "GB Mix Trevo",
    "address": "Av. João César Oliveira, 01 - Parque Res. Jardim do Sol, Rio Grande - RS, 96216-000",
    "city": "Rio Grande",
    "phone": "53 2125-2205",
    "lat": -32.1041,
    "lng": -52.1667
  },
  {
    "id": 78,
    "network": "Nicolini",
    "name": "Nicolini Tupi Silveira 1798",
    "address": "Av. Tupi Silveira, 1798 - Centro, Bagé - RS, 96400-110",
    "city": "Bagé",
    "phone": "53 3242-3673",
    "lat": -31.3195,
    "lng": -54.1074
  },
  {
    "id": 79,
    "network": "Nicolini",
    "name": "Nicolini Tupi Silveira 1400",
    "address": "Av. Tupi Silveira, 1400 - Centro, Bagé - RS, 96400-110",
    "city": "Bagé",
    "phone": "53 3012-0808",
    "lat": -31.3247,
    "lng": -54.1067
  },
  {
    "id": 80,
    "network": "Nicolini",
    "name": "Nicolini General Neto",
    "address": "R. Gen. Neto, 185 - Centro, Bagé - RS, 96400-380",
    "city": "Bagé",
    "phone": "53 3242-4473",
    "lat": -31.3306,
    "lng": -54.103
  },
  {
    "id": 81,
    "network": "Nicolini",
    "name": "Nicolini Monsenhor Costábile Hipólito",
    "address": "R. Monsenhor Costábile Hipólito, 239 - Centro, Bagé - RS, 96400-590",
    "city": "Bagé",
    "phone": "53 3241-5221",
    "lat": -31.3319,
    "lng": -54.109
  },
  {
    "id": 82,
    "network": "Nicolini",
    "name": "Nicolini Gomes Carneiro",
    "address": "R. Gomes Carneiro, 1298 - Centro, Bagé - RS, 96400-130",
    "city": "Bagé",
    "phone": "53 3242-3659",
    "lat": -31.327,
    "lng": -54.1109
  },
  {
    "id": 83,
    "network": "Nicolini",
    "name": "Nicolini Getúlio Vargas",
    "address": "R. Dr. Freitas, 146 - Getúlio Vargas, Bagé - RS, 96412-400",
    "city": "Bagé",
    "phone": "53 3012-0101",
    "lat": -31.321,
    "lng": -54.0938
  },
  {
    "id": 84,
    "network": "Nicolini",
    "name": "Nicolini Estrela D'Alva",
    "address": "Av. Pa Abílio Sponchiado, 2028 - Estrela D'Alva, Bagé - RS, 96415-200",
    "city": "Bagé",
    "phone": "53 3242-8544",
    "lat": -31.3307,
    "lng": -54.0769
  },
  {
    "id": 85,
    "network": "Righi",
    "name": "Righi Uruguai",
    "address": "R. Uruguai, 1132 - Centro, Sant'Ana do Livramento - RS, 97573-541",
    "city": "Santana do Livramento",
    "phone": "55 3621-2508",
    "lat": -30.892,
    "lng": -55.5381
  },
  {
    "id": 86,
    "network": "Righi",
    "name": "Righi JP 680",
    "address": "Av. João Pessoa, 680 - Centro, Sant'Ana do Livramento - RS, 97573-520",
    "city": "Santana do Livramento",
    "phone": "55 3621-2502",
    "lat": -30.8929,
    "lng": -55.5406
  },
  {
    "id": 87,
    "network": "Righi",
    "name": "Righi Treze",
    "address": "R. Treze de Maio, 1200 - Centro, Sant'Ana do Livramento - RS, 97573-500",
    "city": "Santana do Livramento",
    "phone": "55 3621-2500",
    "lat": -30.8853,
    "lng": -55.533
  },
  {
    "id": 88,
    "network": "Righi",
    "name": "Righi JP 22",
    "address": "Av. João Pessoa, 22 - Centro, Sant'Ana do Livramento - RS, 97573-520",
    "city": "Santana do Livramento",
    "phone": "55 3621-2503",
    "lat": -30.8897,
    "lng": -55.546
  },
  {
    "id": 89,
    "network": "Righi",
    "name": "Righi Paul Harris",
    "address": "Av. Paul Harris, 296 - Divisa, Sant'Ana do Livramento - RS, 97574-360",
    "city": "Santana do Livramento",
    "phone": "55 3621-2507",
    "lat": -30.9002,
    "lng": -55.5331
  },
  {
    "id": 90,
    "network": "Righi",
    "name": "Righi Gen. Daltro Filho",
    "address": "Av. Gen. Daltro Filho, 1351 - Centro, Sant'Ana do Livramento - RS, 97576-000",
    "city": "Santana do Livramento",
    "phone": "55 3241-1600",
    "lat": -30.891,
    "lng": -55.5176
  },
  {
    "id": 91,
    "network": "Righi",
    "name": "Righi Armour",
    "address": "Av. Francisco Reverbel de Araújo Góes, 3000 - Armour, Sant'Ana do Livramento - RS, 97500-000",
    "city": "Santana do Livramento",
    "phone": "55 3621-2504",
    "lat": -30.8919,
    "lng": -55.4949
  },
  {
    "id": 92,
    "network": "Baklizi",
    "name": "Baklizi Loja 3 (Gen. Canabarro)",
    "address": "R. Gen. Canabarro, 2903 - Centro, Uruguaiana - RS, 97501-663",
    "city": "Uruguaiana",
    "phone": "55 2102-2200",
    "lat": -29.7623,
    "lng": -57.084
  },
  {
    "id": 93,
    "network": "Baklizi",
    "name": "Baklizi Domingos de Almeida",
    "address": "R. Domingos de Almeida, 2531 - Centro, Uruguaiana - RS, 97500-002",
    "city": "Uruguaiana",
    "phone": null,
    "lat": -29.7622,
    "lng": -57.0846
  },
  {
    "id": 94,
    "network": "Baklizi",
    "name": "Baklizi Loja 4 (Gen. Câmara)",
    "address": "R. Gen. Câmara, 1836 - Centro, Uruguaiana - RS, 97500-281",
    "city": "Uruguaiana",
    "phone": "55 3413-3637",
    "lat": -29.7556,
    "lng": -57.0833
  },
  {
    "id": 95,
    "network": "Baklizi",
    "name": "Baklizi Cidade Alegria",
    "address": "Ac. Mal. Setembrino de Carvalho, 1699 - Cidade Alegria, Uruguaiana - RS, 97500-580",
    "city": "Uruguaiana",
    "phone": "55 3411-4171",
    "lat": -29.7793,
    "lng": -57.0659
  },
  {
    "id": 96,
    "network": "Baklizi",
    "name": "Baklizi New Town",
    "address": "R. Dr. Maia, 272-390 - Centro, Uruguaiana - RS, 97510-161",
    "city": "Uruguaiana",
    "phone": null,
    "lat": -29.7597,
    "lng": -57.0641
  },
  {
    "id": 97,
    "network": "Baklizi",
    "name": "Baklizi Old Embral",
    "address": "R. Pinheiro Machado, 476-550 - Cabo Luís Quevedo, Uruguaiana - RS, 97510-180",
    "city": "Uruguaiana",
    "phone": "55 3412-4994",
    "lat": -29.7781,
    "lng": -57.1048
  },
  {
    "id": 98,
    "network": "Baklizi",
    "name": "Baklizi Loja 1 (Duque de Caxias)",
    "address": "R. Duque de Caxias, 1395 - Sl A - Centro, Uruguaiana - RS, 97650-000",
    "city": "Uruguaiana",
    "phone": null,
    "lat": -29.7519,
    "lng": -57.0863
  },
  {
    "id": 99,
    "network": "Baklizi",
    "name": "Baklizi Shop 5 (Pinheiro Machado)",
    "address": "R. Pinheiro Machado, 1543 - Cabo Luís Quevedo, Uruguaiana - RS, 97503-850",
    "city": "Uruguaiana",
    "phone": "55 3413-3116",
    "lat": -29.778,
    "lng": -57.0982
  },
  {
    "id": 100,
    "network": "Baklizi",
    "name": "Baklizi Loja 8 (Gen. Flores da Cunha)",
    "address": "R. Gen. Flores da Cunha, 1097 - Centro, Uruguaiana - RS, 97501-624",
    "city": "Uruguaiana",
    "phone": "55 3411-7755",
    "lat": -29.749,
    "lng": -57.0798
  },
  {
    "id": 101,
    "network": "Rede Polo",
    "name": "Rede Super / Rede Polo Lajeado",
    "address": "R. Osvaldo Aranha, 847 - Centro, Lajeado - RS, 95900-000",
    "city": "Lajeado",
    "phone": "51 3748-4897",
    "lat": -29.4717,
    "lng": -51.9678
  },
  {
    "id": 102,
    "network": "Cotripal",
    "name": "Supermercado Cotripal Panambi",
    "address": "R. Benjamin Constant, 85 - Centro, Panambi - RS, 98280-000",
    "city": "Panambi",
    "phone": "55 3375-9091",
    "lat": -28.2889,
    "lng": -53.5
  },
  {
    "id": 103,
    "network": "Supermercados Beltrame",
    "name": "Beltrame Hélvio Basso",
    "address": "Av. Hélvio Basso, 1145 - Duque de Caxias, Santa Maria - RS, 97070-805",
    "city": "Santa Maria",
    "phone": "55 3028-9460",
    "lat": -29.7044,
    "lng": -53.8163
  },
  {
    "id": 104,
    "network": "Supermercados Beltrame",
    "name": "Beltrame Euclides da Cunha",
    "address": "R. Euclídes da Cunha, 1579 - Pres. João Goulart, Santa Maria - RS, 97050-620",
    "city": "Santa Maria",
    "phone": "55 3028-9460",
    "lat": -29.6849,
    "lng": -53.7928
  },
  {
    "id": 105,
    "network": "Supermercados Beltrame",
    "name": "Beltrame Venâncio Aires",
    "address": "R. Venâncio Aires, 2650 - Centro, Santa Maria - RS, 97010-003",
    "city": "Santa Maria",
    "phone": "55 3028-9460",
    "lat": -29.6885,
    "lng": -53.8282
  },
  {
    "id": 106,
    "network": "Supermercados Beltrame",
    "name": "Beltrame Camobi",
    "address": "Rod. RST 287, Km 240, 5826 - Camobi, Santa Maria - RS, 97105-910",
    "city": "Santa Maria",
    "phone": "55 3028-9460",
    "lat": -29.705,
    "lng": -53.7218
  },
  {
    "id": 107,
    "network": "Supermercados Beltrame",
    "name": "Beltrame Parque Pinheiro Machado",
    "address": "R. Maranhão, 814 - Pinheiro Machado, Santa Maria - RS, 97030-350",
    "city": "Santa Maria",
    "phone": "55 3028-9460",
    "lat": -29.6918,
    "lng": -53.8734
  }
];

export const marketsService = {
  /**
   * Retorna todos os supermercados cadastrados
   * @returns {Array}
   */
  getAll() {
    return MARKETS_DATA;
  },

  /**
   * Busca supermercados próximos a uma coordenada (lat, lng)
   * @param {number} userLat Latitude do usuário
   * @param {number} userLng Longitude do usuário
   * @param {number} [maxDistanceKm=null] Distância máxima em km (opcional)
   * @returns {Array} Lista de mercados ordenados pela distância (contém a chave 'distance')
   */
  findNearby(userLat, userLng, maxDistanceKm = null) {
    if (userLat == null || userLng == null) return [];

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let results = MARKETS_DATA.map((market) => ({
      ...market,
      distance: calculateDistance(userLat, userLng, market.lat, market.lng),
    }));

    if (maxDistanceKm) {
      results = results.filter((m) => m.distance <= maxDistanceKm);
    }

    return results.sort((a, b) => a.distance - b.distance);
  },

  /**
   * Busca um supermercado pelo ID
   * @param {number} id
   * @returns {Object|undefined}
   */
  getById(id) {
    return MARKETS_DATA.find(market => market.id === id);
  },

  /**
   * Filtra os supermercados por cidade
   * @param {string} city
   * @returns {Array}
   */
  getByCity(city) {
    if (!city) return MARKETS_DATA;
    return MARKETS_DATA.filter(
      market => market.city.toLowerCase() === city.toLowerCase()
    );
  },

  /**
   * Filtra os supermercados por rede/empresa
   * @param {string} network
   * @returns {Array}
   */
  getByNetwork(network) {
    if (!network) return MARKETS_DATA;
    return MARKETS_DATA.filter(
      market => market.network.toLowerCase() === network.toLowerCase()
    );
  },

  /**
   * Retorna a lista das cidades disponíveis sem duplicatas
   * @returns {Array<string>}
   */
  getCities() {
    return [...new Set(MARKETS_DATA.map(m => m.city))].sort();
  },

  /**
   * Retorna a lista de redes/empresas sem duplicatas
   * @returns {Array<string>}
   */
  getNetworks() {
    return [...new Set(MARKETS_DATA.map(m => m.network))].sort();
  }
};

export default marketsService;
