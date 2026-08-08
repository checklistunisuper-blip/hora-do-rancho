import { APP_CONFIG } from "../config/config.js";
import { storageService } from "../services/storageService.js";
import { notificationService } from "../services/notificationService.js";

export async function render() {
  const perfil = storageService.getPreference("perfil", { nome: "", cidade: "" });
  const tema = storageService.getPreference("tema", "claro");
  const idioma = storageService.getPreference("idioma", "pt-BR");

  return `
    <section class="screen perfil-screen">
      <header class="page-header">
        <h1>Perfil & Configurações</h1>
        <p class="muted">Gerencie suas preferências e veja informações sobre o aplicativo.</p>
      </header>

      <!-- Formulário do Perfil -->
      <form id="form-perfil" class="card">
        <h3 class="section-title" style="margin-top: 0;">Dados Pessoais & Preferências</h3>
        
        <label for="perfil-nome">Nome</label>
        <input type="text" id="perfil-nome" value="${perfil.nome || ""}" placeholder="Seu nome" />

        <label for="perfil-cidade">Cidade</label>
        <input type="text" id="perfil-cidade" value="${perfil.cidade || ""}" placeholder="Sua cidade" />

        <label for="perfil-tema">Tema</label>
        <select id="perfil-tema">
          <option value="claro" ${tema === "claro" ? "selected" : ""}>☀️ Claro</option>
          <option value="escuro" ${tema === "escuro" ? "selected" : ""}>🌙 Escuro</option>
        </select>

        <label for="perfil-idioma">Idioma</label>
        <select id="perfil-idioma">
          <option value="pt-BR" ${idioma === "pt-BR" ? "selected" : ""}>Português (Brasil)</option>
          <option value="en-US" ${idioma === "en-US" ? "selected" : ""}>English</option>
        </select>

        <button type="submit" class="btn btn--primary btn--block" style="margin-top: 1rem;">💾 SALVAR PERFIL</button>
        <div id="salvar-perfil-status" class="status-message" role="status"></div>
      </form>

      <!-- Card de Notificações -->
      <div class="card" style="margin-top: 1rem;">
        <h3 class="section-title" style="margin-top: 0;">Notificações</h3>
        <p class="muted">Receba alertas de novas ofertas e queda de preços em favoritos.</p>
        <button id="btn-ativar-notificacoes" class="btn btn--outline btn--block">🔔 ATIVAR NOTIFICAÇÕES</button>
      </div>

      <!-- Card Sobre & Suporte -->
      <div class="card sobre-card" style="margin-top: 1rem;">
        <div class="sobre-header" style="text-align: center; padding: 0.5rem 0 1rem 0;">
          <h2 style="margin: 0; font-size: 1.25rem; color: var(--primary-color, #1b5e20);">${APP_CONFIG.appName || "HORA DO RANCHO"}</h2>
          <p class="muted" style="margin: 0.25rem 0 0 0; font-size: 0.9rem; font-weight: 600;">
            ${APP_CONFIG.company || "WP DIGITAL VAREJO"}
          </p>
          <span class="badge" style="display: inline-block; margin-top: 0.5rem; background: var(--bg-muted, #e8f5e9); color: var(--text-color, #2e7d32); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">
            Versão ${APP_CONFIG.version || "1.0.0"}
          </span>
        </div>

        <hr style="border: 0; border-top: 1px solid var(--border-color, #eee); margin: 0.5rem 0 1rem 0;" />

        <!-- Informações de Contato -->
        <div class="contato-info" style="margin-bottom: 1rem; font-size: 0.9rem;">
          <h4 style="margin: 0 0 0.5rem 0;">Suporte & Contato</h4>
          <p style="margin: 0.25rem 0; color: var(--text-color, #333);">
            📧 <strong>E-mail:</strong> <a href="mailto:criativowill@gmail.com" style="color: inherit; text-decoration: underline;">criativowill@gmail.com</a>
          </p>
          <p style="margin: 0.25rem 0; color: var(--text-color, #333);">
            📱 <strong>WhatsApp / Tel:</strong> <a href="https://wa.me/5551989640590" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline;">(51) 98964-0590</a>
          </p>
        </div>

        <div class="sobre-acoes" style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button id="btn-politica-privacidade" type="button" class="btn btn--secondary btn--block" style="text-align: left; display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0.75rem 1rem;">
            <span>🔒 Política de Privacidade</span>
            <span>➔</span>
          </button>
        </div>
      </div>

      <!-- Modal da Política de Privacidade -->
      <dialog id="modal-politica" class="modal" style="padding: 1.5rem; border: none; border-radius: 12px; max-width: 520px; width: 90%; background: var(--card-bg, #fff); color: var(--text-color, #333);">
        <h3 style="margin-top: 0; color: var(--primary-color, #1b5e20);">Política de Privacidade</h3>
        <div class="modal-body" style="max-height: 55vh; overflow-y: auto; font-size: 0.9rem; line-height: 1.5;">
          <p><strong>${APP_CONFIG.appName || "HORA DO RANCHO"} — ${APP_CONFIG.company || "WP DIGITAL VAREJO"} (v${APP_CONFIG.version || "1.0.0"})</strong></p>

          <p><strong>1. Sem Coleta de Dados Sensíveis</strong><br>
          O aplicativo <u>não pede, não coleta e não retém</u> qualquer tipo de informação sensível ou pessoal, tais como CPF, dados bancários, cartões de crédito, senhas, e-mails de login, dados de saúde ou biometria.</p>

          <p><strong>2. Processamento Exclusivamente Local</strong><br>
          Suas listas de compras, ofertas salvas e preferências ficam armazenadas apenas no seu próprio dispositivo (LocalStorage/IndexedDB). O aplicativo não envia nem retém esses dados em servidores externos.</p>

          <p><strong>3. Câmera e Leitura OCR</strong><br>
          As capturas de tela e fotos processadas pelo leitor OCR são analisadas localmente no seu aparelho. Nenhuma imagem é enviada ou armazenada fora do seu dispositivo.</p>

          <p><strong>4. Localização</strong><br>
          O GPS é utilizado apenas no momento do uso para mostrar os supermercados mais próximos no mapa, sem registro do seu histórico de rotas ou movimentação.</p>

          <p><strong>5. Contato do Desenvolvedor</strong><br>
          Em caso de dúvidas sobre esta política ou suporte:<br>
          • <strong>E-mail:</strong> criativowill@gmail.com<br>
          • <strong>Telefone:</strong> (51) 98964-0590</p>
        </div>
        <div style="margin-top: 1.5rem; text-align: right;">
          <button id="btn-fechar-politica" type="button" class="btn btn--primary" style="padding: 0.5rem 1.25rem;">Fechar</button>
        </div>
      </dialog>
    </section>
  `;
}

export async function afterRender() {
  // ---- Evento de Salvar Perfil e Preferências ----
  const formPerfil = document.getElementById("form-perfil");
  if (formPerfil) {
    formPerfil.addEventListener("submit", (e) => {
      e.preventDefault();

      // Utiliza savePreference para padronizar com storageService
      const saveFn = typeof storageService.savePreference === "function" 
        ? storageService.savePreference.bind(storageService) 
        : storageService.setPreference.bind(storageService);

      saveFn("perfil", {
        nome: document.getElementById("perfil-nome").value,
        cidade: document.getElementById("perfil-cidade").value,
      });

      const tema = document.getElementById("perfil-tema").value;
      saveFn("tema", tema);
      saveFn("idioma", document.getElementById("perfil-idioma").value);
      
      document.documentElement.dataset.theme = tema;

      const statusEl = document.getElementById("salvar-perfil-status");
      if (statusEl) {
        statusEl.textContent = "✅ Configurações salvas com sucesso!";
        setTimeout(() => { statusEl.textContent = ""; }, 3000);
      }
    });
  }

  // ---- Ativar Notificações ----
  const btnNotificacoes = document.getElementById("btn-ativar-notificacoes");
  if (btnNotificacoes) {
    btnNotificacoes.addEventListener("click", async () => {
      if (notificationService && typeof notificationService.requestPermission === "function") {
        const status = await notificationService.requestPermission();
        btnNotificacoes.textContent =
          status === "granted" ? "✅ NOTIFICAÇÕES ATIVADAS" : "Permissão não concedida";
      }
    });
  }

  // ---- Modal Política de Privacidade ----
  const btnPolitica = document.getElementById("btn-politica-privacidade");
  const modalPolitica = document.getElementById("modal-politica");
  const btnFechar = document.getElementById("btn-fechar-politica");

  if (btnPolitica && modalPolitica) {
    btnPolitica.addEventListener("click", () => {
      if (typeof modalPolitica.showModal === "function") {
        modalPolitica.showModal();
      } else {
        modalPolitica.setAttribute("open", "true");
      }
    });
  }

  if (btnFechar && modalPolitica) {
    btnFechar.addEventListener("click", () => {
      if (typeof modalPolitica.close === "function") {
        modalPolitica.close();
      } else {
        modalPolitica.removeAttribute("open");
      }
    });
  }
}
