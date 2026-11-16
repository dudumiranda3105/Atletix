"""Captura as telas do Atletix usadas na seção 8 do documento (salvas em docs/md/imagens/).

Antes de rodar, deixe a API e a interface no ar com os dados de demonstração:
    backend:  npm run semente  e  npm run start
    frontend: npm run dev

Uso (na pasta do projeto):
    uv run --no-project --python 3.12 --with playwright python docs/pdf/capturar_telas.py

A senha das contas de demonstração é lida de backend/.env.example (SEMENTE_SENHA).
"""
import re
from pathlib import Path

from playwright.sync_api import Browser, Page, sync_playwright

RAIZ = Path(__file__).resolve().parents[2]
IMAGENS = RAIZ / "docs" / "md" / "imagens"
SITE = "http://localhost:5173"
SENHA = re.search(
    r"^SEMENTE_SENHA=(.+)$", (RAIZ / "backend" / ".env.example").read_text(encoding="utf-8"), re.M
).group(1).strip()


def abrir(navegador: Browser, email: str | None = None, tema: str = "claro", celular: bool = False) -> Page:
    """Abre uma janela isolada (uma sessão por perfil) e, se houver e-mail, faz o login pela tela."""
    tamanho = {"width": 390, "height": 844} if celular else {"width": 1280, "height": 800}
    contexto = navegador.new_context(viewport=tamanho, device_scale_factor=2 if celular else 1.5, locale="pt-BR")
    contexto.add_init_script(f"localStorage.setItem('atletix.tema', '{tema}')")
    pagina = contexto.new_page()
    if email:
        pagina.goto(f"{SITE}/entrar")
        pagina.get_by_label("E-mail", exact=True).fill(email)
        pagina.get_by_label("Senha", exact=True).fill(SENHA)
        pagina.get_by_role("button", name="Entrar").click()
        pagina.wait_for_url("**/painel")
    return pagina


def capturar(pagina: Page, nome: str, caminho: str | None = None, esperar: str | None = None) -> None:
    if caminho:
        pagina.goto(SITE + caminho)
    if esperar:
        pagina.get_by_text(re.compile(esperar)).first.wait_for()
    pagina.wait_for_load_state("networkidle")
    pagina.wait_for_timeout(1300)  # espera as animações de entrada terminarem
    pagina.screenshot(path=IMAGENS / f"{nome}.png")
    print("capturada:", nome)


def main() -> None:
    IMAGENS.mkdir(exist_ok=True)
    with sync_playwright() as p:
        try:
            navegador = p.chromium.launch(channel="chrome")
        except Exception:
            navegador = p.chromium.launch(channel="msedge")

        visitante = abrir(navegador)
        capturar(visitante, "entrar", "/entrar", "Esqueci minha senha")
        visitante.goto(f"{SITE}/recuperar-senha")
        visitante.get_by_label("E-mail da conta").fill("aluno.sem.matricula@atletix.dev")
        visitante.get_by_role("button", name="Enviar link").click()
        visitante.get_by_text("o link de redefinição foi enviado").wait_for()

        aluna = abrir(navegador, "aluna@atletix.dev")
        capturar(aluna, "painel-aluno", "/painel", "pode fazer")
        aluna.goto(f"{SITE}/checkin")
        aluna.get_by_text(re.compile("Entrada liberada|Toque no botão")).first.wait_for()
        botao = aluna.get_by_role("button", name="Fazer check-in")
        if botao.count():  # se o check-in de hoje já foi feito, o botão não existe
            botao.click()
        capturar(aluna, "checkin", esperar="Entrada liberada")
        capturar(aluna, "acesso-negado", "/usuarios", "Acesso negado")

        recepcao = abrir(navegador, "recepcao@atletix.dev")
        recepcao.goto(f"{SITE}/matriculas")
        recepcao.get_by_role("button", name=re.compile("Alice Aluna")).click()
        capturar(recepcao, "matriculas", esperar="Registrar ou renovar")

        admin = abrir(navegador, "admin@atletix.dev")
        capturar(admin, "painel-admin", "/painel", "pode fazer")
        capturar(admin, "usuarios", "/usuarios", "Rafael Recepção")
        capturar(admin, "auditoria", "/auditoria", "eventos?$")
        capturar(admin, "caixa-de-saida", "/caixa-de-saida", "redefinição de senha")

        celular = abrir(navegador, "aluna@atletix.dev", celular=True)
        capturar(celular, "celular-checkin", "/checkin", "Entrada liberada|Fazer check-in")
        celular_admin = abrir(navegador, "admin@atletix.dev", tema="escuro", celular=True)
        capturar(celular_admin, "celular-painel", "/painel", "pode fazer")

        escuro = abrir(navegador, "admin@atletix.dev", tema="escuro")
        capturar(escuro, "painel-escuro", "/painel", "pode fazer")

        navegador.close()


if __name__ == "__main__":
    main()
