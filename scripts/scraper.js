import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const TARGET_MARKETS = [
  {
    id: 'stok-canoas',
    nome: 'Stok Center — Canoas',
    url: 'https://www.stokcenter.com.br/ofertas'
  }
];

async function runScraper() {
  console.log('🚀 Iniciando robô de busca de ofertas...');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });

  const updatedOffers = {};
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  for (const market of TARGET_MARKETS) {
    try {
      console.log(`🔍 Acessando: ${market.nome} (${market.url})`);
      const page = await browser.newPage();
      await page.goto(market.url, { waitUntil: 'networkidle2', timeout: 60000 });

      const pageText = await page.evaluate(() => document.body.innerText);
      await page.close();

      console.log(`🤖 Analisando conteúdo com IA...`);

      const prompt = `
        Analise o texto a seguir extraído de um site de supermercado no RS e filtre apenas as ofertas ativas de produtos.
        Retorne ESTRITAMENTE um array JSON válido sem marcadores markdown adicionais ou texto explicativo no formato:
        [
          { "id": "p1", "produto": "Nome do Produto + Gramatura", "preco": "R$ XX,XX" }
        ]

        Texto extraído:
        ${pageText.substring(0, 15000)}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      let rawText = response.text().trim();
      rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
      
      const ofertas = JSON.parse(rawText);
      console.log(`✅ ${ofertas.length} ofertas capturadas para ${market.nome}`);
      updatedOffers[market.id] = ofertas;

    } catch (error) {
      console.error(`❌ Erro em ${market.nome}:`, error.message);
    }
  }

  await browser.close();

  const payload = {
    updatedAt: new Date().toISOString(),
    dataFormatada: new Date().toLocaleDateString('pt-BR'),
    ofertasPorMercado: updatedOffers
  };

  const outputPath = path.resolve('public/data/ofertas-capturadas.json');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`💾 Salvo em: ${outputPath}`);
}

runScraper();
