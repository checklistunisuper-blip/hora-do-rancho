import { APP_CONFIG } from "../config/config.js";
import { storageService } from "../services/storageService.js";
import { notificationService } from "../services/notificationService.js";

export async function render() {
  const perfil = storageService.getPreference("perfil", { nome: "", cidade: "" });
  const tema = storageService.getPreference("tema", "claro");
  const idioma = storageService.getPreference("idioma", "pt-BR");

  return `
    <section class="screen perfil-screen">
      <header class="page-header"><h1>Perfil</h1></header>

      <form id="form-perfil" class="card">
        <label for="perfil-nome">Nome</label>
        <input type="text" id="perfil-nome" value="${perfil.nome || ""}" placeholder="Seu nome" />

        <label for="perfil-cidade">Cidade</label>
        <input type="text" id="perfil-cidade" value="${perfil.cidade || ""}" placeholder="Sua cidade" />

        <label for="perfil-tema">Tema</label>
        <select id="perfil-tema">
          <option value="claro" ${tema === "claro" ? "selected" : ""}>Claro</option>
          <option value="escuro" ${tema === "escuro" ? "selected" : ""}>Escuro</option>
        </select>

        <label for="perfil-idioma">Idioma</label>
        <select id="perfil-idioma">
          <option value="pt-BR" ${idioma === "pt-BR" ? "selected" : ""}>Português (Brasil)</option>
          <option value="en-US" ${idioma === "en-US" ? "selected" : ""}>English</option>
        </select>

        <button type="submit" class="btn btn--primary btn--block">SALVAR</button>
      </form>

      <div class="card">
        <h3 class="section-title">Notificações</h3>
        <p class="muted">Receba alertas de novas ofertas e queda de preços em favoritos.</p>
        <button id="btn-ativar-notificacoes" class="btn btn--outline btn--block">ATIVAR NOTIFICAÇÕES</button>
      </div>

      <div class="card">
        <h3 class="section-title">Sobre</h3>
        <p>${APP_CONFIG.appName} — ${APP_CONFIG.company}</p>
        <p class="muted">Versão ${APP_CONFIG.version}</p>
        <a href="#/privacidade" class="link">Política de Privacidade</a>
      </div>
    </section>
  `;
}

export async function afterRender() {
  document.getElementById("form-perfil").addEventListener("submit", (e) => {
    e.preventDefault();
    storageService.setPreference("perfil", {
      nome: document.getElementById("perfil-nome").value,
      cidade: document.getElementById("perfil-cidade").value,
    });
    const tema = document.getElementById("perfil-tema").value;
    storageService.setPreference("tema", tema);
    storageService.setPreference("idioma", document.getElementById("perfil-idioma").value);
    document.documentElement.dataset.theme = tema;
  });

  document.getElementById("btn-ativar-notificacoes").addEventListener("click", async () => {
    const status = await notificationService.requestPermission();
    const btn = document.getElementById("btn-ativar-notificacoes");
    btn.textContent =
      status === "granted" ? "✅ NOTIFICAÇÕES ATIVADAS" : "Permissão não concedida";
  });
}
