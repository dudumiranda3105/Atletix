"""Gera o PDF da apresentação a partir de docs/apresentacao/slides.html.

Uso (na pasta do projeto):
    uv run --no-project --python 3.12 --with playwright python docs/pdf/gerar_slides.py

Requer Chrome ou Edge e internet (para desenhar os diagramas). O PDF gerado não depende de internet.
As fontes Barlow são embutidas a partir de frontend/node_modules; rode "npm install" no frontend antes.
"""
import base64
from pathlib import Path

from playwright.sync_api import sync_playwright

DOCS = Path(__file__).resolve().parent.parent
ORIGEM = DOCS / "apresentacao" / "slides.html"
SAIDA = DOCS / "apresentacao" / "Apresentacao_Atletix.pdf"
FONTES = DOCS.parent / "frontend" / "node_modules" / "@fontsource"
ARQUIVOS_DE_FONTE = [
    ("Barlow", 400, "barlow/files/barlow-latin-400-normal.woff2"),
    ("Barlow", 600, "barlow/files/barlow-latin-600-normal.woff2"),
    ("Barlow Condensed", 700, "barlow-condensed/files/barlow-condensed-latin-700-normal.woff2"),
]


def css_das_fontes() -> str:
    regras = []
    for familia, peso, caminho in ARQUIVOS_DE_FONTE:
        arquivo = FONTES / caminho
        if not arquivo.exists():
            print(f"Aviso: fonte {familia} {peso} não encontrada; será usada a fonte do sistema.")
            continue
        dados = base64.b64encode(arquivo.read_bytes()).decode("ascii")
        regras.append(
            f"@font-face {{ font-family: '{familia}'; font-weight: {peso}; "
            f"src: url(data:font/woff2;base64,{dados}) format('woff2'); }}"
        )
    return "\n".join(regras)


def main() -> None:
    # O arquivo temporário fica ao lado do original para os caminhos das imagens continuarem valendo.
    temporario = ORIGEM.with_name("_slides_gerados.html")
    temporario.write_text(ORIGEM.read_text(encoding="utf-8").replace("/*FONTES*/", css_das_fontes()), encoding="utf-8")
    try:
        with sync_playwright() as p:
            try:
                navegador = p.chromium.launch(channel="chrome")
            except Exception:
                navegador = p.chromium.launch(channel="msedge")
            pagina = navegador.new_page(viewport={"width": 1280, "height": 720})
            pagina.goto(temporario.as_uri(), wait_until="networkidle")
            pagina.wait_for_function("window.__pronto === true", timeout=60000)
            erro = pagina.evaluate("window.__erro || null")
            if erro:
                raise RuntimeError(f"Falha ao desenhar um diagrama: {erro}")
            pagina.evaluate("document.fonts.ready")
            pagina.pdf(path=str(SAIDA), width="1280px", height="720px", print_background=True)
            total = pagina.locator("section.slide").count()
            navegador.close()
        print(f"Apresentação gerada: {SAIDA} ({total} slides)")
    finally:
        temporario.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
