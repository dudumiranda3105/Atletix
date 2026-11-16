# Documentação arquitetural — Atletix

Documento final enviado ao professor (versão 1.0) e material da apresentação.

| Pasta | O que tem |
|---|---|
| [pdf/](pdf/) | Os PDFs prontos e o que os gera: scripts, folha de estilo e o HTML dos slides |
| [md/](md/) | Os textos em Markdown: seções do documento, ADRs, imagens das telas e roteiro da apresentação |

## PDFs prontos

- [Documentacao_Arquitetura_Atletix.pdf](pdf/Documentacao_Arquitetura_Atletix.pdf): documento arquitetural, 47 páginas.
- [Apresentacao_Atletix.pdf](pdf/Apresentacao_Atletix.pdf): 14 slides, formato 16:9.

## Textos em Markdown

| Seção | Arquivo |
|---|---|
| 1. Descrição do problema e escopo | [01-escopo-e-problema.md](md/01-escopo-e-problema.md) |
| 2. Estilo arquitetural e trade-offs | [02-estilo-arquitetural.md](md/02-estilo-arquitetural.md) |
| 3. Módulos e responsabilidades | [03-modulos.md](md/03-modulos.md) |
| 4. Análise de coesão | [04-coesao.md](md/04-coesao.md) |
| 5. Análise de acoplamento | [05-acoplamento.md](md/05-acoplamento.md) |
| 6. Análise de conascência | [06-conascencia.md](md/06-conascencia.md) |
| 7. Rastreabilidade entre documento e código | [07-rastreabilidade.md](md/07-rastreabilidade.md) |
| 8. A aplicação em funcionamento (telas) | [08-aplicacao.md](md/08-aplicacao.md) |
| 9. Referências | [09-referencias.md](md/09-referencias.md) |
| Roteiro da apresentação | [roteiro-da-apresentacao.md](md/roteiro-da-apresentacao.md) |

Decisões registradas (ADRs), que formam o Apêndice A do documento:

- [ADR-001 — Monólito modular particionado por domínio](md/adr/ADR-001-estilo-arquitetural.md)
- [ADR-002 — Stack NestJS + TypeScript e entrega como aplicação funcional](md/adr/ADR-002-stack-e-entrega.md)
- [ADR-003 — Camadas dentro de cada módulo](md/adr/ADR-003-camadas-dentro-dos-modulos.md)
- [ADR-004 — Separar Identidade, Autorização e Usuários](md/adr/ADR-004-identidade-autorizacao-e-usuarios.md)
- [ADR-005 — Estratégia de tokens e sessões](md/adr/ADR-005-tokens-e-sessoes.md)
- [ADR-006 — Eventos internos para efeitos colaterais](md/adr/ADR-006-eventos-internos.md)

## Como regenerar os PDFs

Os arquivos de `md/` são a fonte do documento. Depois de editar um deles, rode na pasta do projeto:

```bash
uv run --no-project --python 3.12 --with markdown --with playwright --with pymupdf python docs/pdf/gerar_pdf.py
```

O script monta a capa, o sumário com páginas, os diagramas Mermaid e os ADRs no apêndice. Requer Chrome ou Edge instalado e internet (para os diagramas). Para incluir uma nova seção, mudar os nomes do trio, o link do repositório ou a versão, edite as constantes no topo de [pdf/gerar_pdf.py](pdf/gerar_pdf.py).

Os slides têm fonte própria, [pdf/slides.html](pdf/slides.html). Depois de editar o HTML:

```bash
uv run --no-project --python 3.12 --with playwright python docs/pdf/gerar_slides.py
```

## Como atualizar as telas da seção 8

Com a API e a interface rodando com os dados de demonstração:

```bash
uv run --no-project --python 3.12 --with playwright python docs/pdf/capturar_telas.py
```

As imagens são salvas em `md/imagens/` e entram no PDF na próxima geração.
