/**
 * firebaseConfig.js
 * Config do projeto Firebase usado para compartilhar as ofertas lidas por
 * foto (Comparador por Foto) entre TODOS os usuários do app.
 *
 * COMO PREENCHER (gratuito, sem cartão de crédito, plano "Spark"):
 * 1. Acesse https://console.firebase.google.com → "Adicionar projeto" → dê um nome
 *    (ex: hora-do-rancho) → pode desativar o Google Analytics (não precisa).
 * 2. No painel do projeto, clique no ícone "</>" (Web) para registrar um app web.
 *    Dê um apelido (ex: hora-do-rancho-web) → "Registrar app".
 * 3. Ele mostra um objeto firebaseConfig com essas mesmas chaves abaixo — copie
 *    os valores reais para cá.
 * 4. No menu lateral → Build → Firestore Database → "Criar banco de dados" →
 *    escolha uma região (ex: southamerica-east1, é a mais próxima do Brasil) →
 *    inicie em modo de PRODUÇÃO.
 * 5. Na aba "Regras" do Firestore, cole o conteúdo de firestore.rules (na raiz
 *    do projeto) e publique.
 * 6. Na aba "TTL" (Time-to-live) do Firestore → "Criar política" → coleção:
 *    ofertasFoto → campo: expiraEm → salvar. Isso faz o Firestore apagar
 *    sozinho, de graça, qualquer oferta com mais de 5 dias.
 */

export const firebaseConfig = {
  apiKey: "COLOQUE_AQUI",
  authDomain: "COLOQUE_AQUI.firebaseapp.com",
  projectId: "COLOQUE_AQUI",
  storageBucket: "COLOQUE_AQUI.appspot.com",
  messagingSenderId: "COLOQUE_AQUI",
  appId: "COLOQUE_AQUI",
};

/** Se true, o app tenta usar o Firestore compartilhado; se false (ou config
 * não preenchida), cai automaticamente para o armazenamento só local. */
export const FIREBASE_HABILITADO = !firebaseConfig.apiKey.includes("COLOQUE_AQUI");
