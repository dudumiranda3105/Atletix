"""Gera o documento arquitetural do Atletix em PDF a partir dos arquivos .md de docs/md/.

Uso (na pasta do projeto):
    uv run --no-project --python 3.12 --with markdown --with playwright --with pymupdf python docs/pdf/gerar_pdf.py

Requer Google Chrome ou Microsoft Edge instalado e internet (para carregar o Mermaid dos diagramas).
Para incluir uma nova seção, adicione o arquivo em SECOES ou ADRS.
"""
import asyncio
import base64
import html
import re
from pathlib import Path

import markdown
import pymupdf as fitz
from playwright.async_api import async_playwright

AQUI = Path(__file__).resolve().parent
FONTES = AQUI.parent / "md"
SAIDA = AQUI / "Documentacao_Arquitetura_Atletix.pdf"
CSS = (AQUI / "estilo.css").read_text(encoding="utf-8")

VERSAO = "Versão 1.0 · novembro de 2026"
INTEGRANTES = ["Eduarda Roberta Borges da Silva", "Eduardo de Miranda", "Rebeca Lucio Souza Chagas"]
REPOSITORIO = "https://github.com/dudumiranda3105/Atletix"

SECOES = [
    "01-escopo-e-problema.md",
    "02-estilo-arquitetural.md",
    "03-modulos.md",
    "04-coesao.md",
    "05-acoplamento.md",
    "06-conascencia.md",
    "07-rastreabilidade.md",
    "08-aplicacao.md",
    "09-referencias.md",
]
ADRS = [
    "adr/ADR-001-estilo-arquitetural.md",
    "adr/ADR-002-stack-e-entrega.md",
    "adr/ADR-003-camadas-dentro-dos-modulos.md",
    "adr/ADR-004-identidade-autorizacao-e-usuarios.md",
    "adr/ADR-005-tokens-e-sessoes.md",
    "adr/ADR-006-eventos-internos.md",
]
TITULO_APENDICE = "Apêndice A — Decisões arquiteturais (ADRs)"

MERMAID = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"
CABECALHO = """<div style="width:100%;margin:0 22mm;font-family:'Segoe UI',Arial,sans-serif;font-size:7.5pt;
color:#1F3A6E;text-align:right;border-bottom:0.6pt solid #C9D3E3;padding-bottom:3pt;">
<b>Uni-FACEF</b> &nbsp;|&nbsp; Departamento de Computação</div>"""
RODAPE = """<div style="width:100%;font-family:Georgia,serif;font-size:7.5pt;color:#5B6577;text-align:center;">
Atletix &nbsp;•&nbsp; Arquitetura de Software &nbsp;|&nbsp;
<span class="pageNumber" style="color:#1F3A6E;font-weight:bold;"></span></div>"""


def limpar_md(texto: str) -> str:
    """Remove o sufixo do título e o bloco de metadados que já aparecem na capa."""
    linhas = texto.splitlines()
    if linhas and linhas[0].startswith("# "):
        linhas[0] = re.sub(r"\s+—\s+Atletix\s*$", "", linhas[0])
        i = 1
        while i < len(linhas) and (not linhas[i].strip() or linhas[i].startswith(">")):
            i += 1
        linhas = [linhas[0], ""] + linhas[i:]
    texto = "\n".join(linhas)
    # blocos mermaid viram <div> (conteúdo escapado; o Mermaid lê o texto)
    return re.sub(
        r"```mermaid\n(.*?)```",
        lambda m: f'\n<div class="figura"><div class="mermaid">{html.escape(m.group(1))}</div></div>\n',
        texto, flags=re.S,
    )


def embutir_imagem(achado: re.Match) -> str:
    """Coloca a imagem dentro do HTML (data URI), pois a página é montada sem endereço base."""
    return f'<div class="captura"><img alt="{achado.group(1)}" src="{dados_da_imagem(achado.group(2))}"></div>'


def dados_da_imagem(caminho: str) -> str:
    return "data:image/png;base64," + base64.b64encode((FONTES / caminho).read_bytes()).decode("ascii")


def md_para_html(texto: str, prefixo: str, rebaixar: int = 0) -> str:
    if rebaixar:
        texto = re.sub(r"^(#{1,5}) ", lambda m: "#" * (len(m.group(1)) + rebaixar) + " ", texto, flags=re.M)
    corpo = markdown.markdown(texto, extensions=["tables", "fenced_code", "toc", "attr_list", "sane_lists"])
    corpo = corpo.replace('id="', f'id="{prefixo}-')
    corpo = re.sub(r'<p><img alt="([^"]*)" src="(imagens/[^"]+)"\s*/?></p>', embutir_imagem, corpo)
    # imagens escritas em HTML direto no .md (ex.: duas telas de celular lado a lado)
    corpo = re.sub(r'src="(imagens/[^"]+)"', lambda m: f'src="{dados_da_imagem(m.group(1))}"', corpo)
    # links entre arquivos .md não fazem sentido no PDF: mantém só o texto
    return re.sub(r'<a href="[^"]*\.md[^"]*">(.*?)</a>', r"\1", corpo)


def titulos(corpo: str, niveis: tuple[str, ...]) -> list[tuple[str, str]]:
    achados = re.findall(r"<(h[1-3])[^>]*>(.*?)</\1>", corpo, flags=re.S)
    return [(n, re.sub(r"<[^>]+>", "", t).strip()) for n, t in achados if n in niveis]


def normalizar(t: str) -> str:
    # sem espaços: o Chrome às vezes perde um espaço ao quebrar a linha do título no outline
    return re.sub(r"\s+", "", html.unescape(t))


def montar_html(paginas: dict[str, int] | None) -> str:
    partes, entradas = [], []
    for i, arq in enumerate(SECOES):
        corpo = md_para_html(limpar_md((FONTES / arq).read_text(encoding="utf-8")), f"s{i}")
        entradas += titulos(corpo, ("h1", "h2"))
        partes.append(corpo)

    adrs = [md_para_html((FONTES / arq).read_text(encoding="utf-8"), f"a{i}", rebaixar=1) for i, arq in enumerate(ADRS)]
    entradas.append(("h1", TITULO_APENDICE))
    for corpo in adrs:
        entradas += titulos(corpo, ("h2",))
    partes.append(f"<h1>{TITULO_APENDICE}</h1>" + "".join(f'<section class="adr">{c}</section>' for c in adrs))

    itens = "".join(
        f'<li class="{"n1" if n == "h1" else "n2"}"><span class="t">{html.escape(t)}</span>'
        f'<span class="pontos"></span><span class="pg">{(paginas or {}).get(normalizar(t), "00")}</span></li>'
        for n, t in entradas
    )
    linhas_integrantes = "".join(
        f"<tr><td>Integrante {i}</td><td>{html.escape(nome) or '<span class=linha>______________________________</span>'}</td></tr>"
        for i, nome in enumerate(INTEGRANTES, 1)
    )
    capa = f"""
<div class="capa">
  <div class="capa-instituicao">Uni-FACEF</div>
  <div class="capa-sub">Centro Universitário Municipal de Franca<br>Departamento de Computação</div>
  <div class="capa-titulo">ATLETIX</div>
  <div class="capa-subtitulo">Sistema de Gestão de Academias<br>Controle de Autenticação</div>
  <div class="capa-tipo">PROPOSTA E EVIDÊNCIAS DA ARQUITETURA DE SOFTWARE</div>
  <div class="capa-desc">Aplicação funcional em NestJS + React (TypeScript); documentação arquitetural e testes.</div>
  <table>
    <thead><tr><th>Identificação</th><th>Informação</th></tr></thead>
    <tbody>
      <tr><td>Curso</td><td>Engenharia de Software</td></tr>
      <tr><td>Disciplina</td><td>Arquitetura de Software</td></tr>
      <tr><td>Turma</td><td>6º semestre</td></tr>
      <tr><td>Docente</td><td>Carlos Alberto Lucas</td></tr>
      {linhas_integrantes}
      <tr><td>Autoria</td><td>Código (API, interface e testes) e documentação desenvolvidos pelos três integrantes</td></tr>
      <tr><td>Entrega / apresentação</td><td>26/11/2026 — até 17h para envio</td></tr>
      <tr><td>Repositório GitHub</td><td>{html.escape(REPOSITORIO)}</td></tr>
    </tbody>
  </table>
  <div class="capa-rodape">Franca – SP &nbsp;|&nbsp; Novembro de 2026
    <div class="capa-versao">{html.escape(VERSAO)}</div></div>
</div>"""
    sumario = f'<div class="sumario"><div class="sumario-titulo">Sumário</div><ol>{itens}</ol></div>'

    return f"""<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Atletix — Documentação Arquitetural</title><style>{CSS}</style></head>
<body>{capa}{sumario}{''.join(partes)}
<script src="{MERMAID}"></script>
<script>
mermaid.initialize({{ startOnLoad: false, theme: "base", securityLevel: "loose",
  themeVariables: {{ fontFamily: "Segoe UI, Arial, sans-serif", fontSize: "16px", lineColor: "#44506A",
    primaryColor: "#E8EEF8", primaryBorderColor: "#2B4C8C", primaryTextColor: "#1B2A4A",
    clusterBkg: "#FAFBFD", clusterBorder: "#B8C4D9", edgeLabelBackground: "#FFFFFF" }},
  flowchart: {{ htmlLabels: true, curve: "basis", padding: 14, nodeSpacing: 38, rankSpacing: 46 }},
  sequence: {{ mirrorActors: false, width: 118, actorMargin: 26, messageFontSize: 16, actorFontSize: 16,
    noteFontSize: 15, boxMargin: 6, messageMargin: 34 }} }});
mermaid.run({{ querySelector: ".mermaid" }})
  .then(() => {{ window.__pronto = true; }})
  .catch(e => {{ window.__erro = String(e); window.__pronto = true; }});
</script></body></html>"""


async def gerar_pdf(navegador, conteudo: str) -> bytes:
    pagina = await navegador.new_page()
    await pagina.set_content(conteudo, wait_until="networkidle")
    await pagina.wait_for_function("window.__pronto === true", timeout=60000)
    erro = await pagina.evaluate("window.__erro || null")
    if erro:
        raise RuntimeError(f"Falha ao renderizar diagrama Mermaid: {erro}")
    pdf = await pagina.pdf(
        format="A4", print_background=True, display_header_footer=True,
        header_template=CABECALHO, footer_template=RODAPE,
        margin={"top": "24mm", "bottom": "20mm", "left": "22mm", "right": "22mm"},
        outline=True, tagged=True,
    )
    await pagina.close()
    return pdf


async def main():
    async with async_playwright() as p:
        try:
            navegador = await p.chromium.launch(channel="chrome")
        except Exception:
            navegador = await p.chromium.launch(channel="msedge")

        rascunho = await gerar_pdf(navegador, montar_html(None))
        with fitz.open(stream=rascunho, filetype="pdf") as doc:
            paginas = {}
            for _, titulo, pg in doc.get_toc():
                paginas.setdefault(normalizar(titulo), pg)

        final = await gerar_pdf(navegador, montar_html(paginas))
        await navegador.close()

    SAIDA.write_bytes(final)
    with fitz.open(SAIDA) as doc:
        faltando = [t for t in re.findall(r'class="t">(.*?)</span>', montar_html(paginas))
                    if normalizar(t) not in paginas]
        print(f"PDF gerado: {SAIDA} ({doc.page_count} páginas)")
        if faltando:
            print("Atenção, sem número de página no sumário:", faltando)


if __name__ == "__main__":
    asyncio.run(main())
