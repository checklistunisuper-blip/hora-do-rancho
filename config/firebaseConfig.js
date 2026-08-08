/**
 * firebaseConfig.js
 * Configuração do projeto Firebase usado para compartilhar as ofertas lidas por
 * foto (Comparador por Foto) entre TODOS os usuários do app.
 */

export const firebaseConfig = {
  apiKey: "AIzaSyCiE1TpbEPK4A8Jlfp9XS6zDmULBHmXG-s",
  authDomain: "hora-do-rancho.firebaseapp.com",
  projectId: "hora-do-rancho",
  storageBucket: "hora-do-rancho.firebasestorage.app",
  messagingSenderId: "731579453303",
  appId: "1:731579453303:web:d49f6b9bdc53fff0e51b72",
  measurementId: "G-QS4RG3RBM7"
};

/** Se true, o app tenta usar o Firestore compartilhado; se false (ou config
 * não preenchida), cai automaticamente para o armazenamento só local. */
export const FIREBASE_HABILITADO = !firebaseConfig.apiKey.includes("COLOQUE_AQUI");
