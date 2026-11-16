# Documentação arquitetural — Atletix

Fontes do documento final enviado ao professor (versão 1.0) e da apresentação.

**PDF atual:** [Documentacao_Arquitetura_Atletix.pdf](Documentacao_Arquitetura_Atletix.pdf)

## Como regenerar o PDF

Os `.md` são a fonte; o PDF é gerado a partir deles (capa, sumário com páginas, diagramas Mermaid e ADRs no apêndice). Na pasta do projeto:

```bash
uv run --no-project --python 3.12 --with markdown --with playwright --with pymupdf python docs/pdf/gerar_pdf.py
```

Requer Chrome ou Edge instalado e internet (para os diagramas). Para incluir uma nova seção, nomes do trio, link do repositório ou mudar a versão, edite as constantes no topo de [pdf/gerar_pdf.py](pdf/gerar_pdf.py).

| Seção | Arquivo | Status |
|---|---|---|
| 1. Descrição do problema e escopo | [01-escopo-e-problema.md](01-escopo-e-problema.md) | Pronta |
| 2. Estilo arquitetural e trade-offs | [02-estilo-arquitetural.md](02-estilo-arquitetural.md) | Pronta |
| 3. Módulos e responsabilidades | [03-modulos.md](03-modulos.md) | Pronta |
| 4. Análise de coesão | [04-coesao.md](04-coesao.md) | Pronta |
| 5. Análise de acoplamento | [05-acoplamento.md](05-acoplamento.md) | Pronta |
| 6. Análise de conascência | [06-conascencia.md](06-conascencia.md) | Pronta |
| 7. Rastreabilidade entre documento e código | [07-rastreabilidade.md](07-rastreabilidade.md) | Pronta |
| 8. A aplicação em funcionamento (telas) | [08-aplicacao.md](08-aplicacao.md) | Pronta |
| 9. Referências | [09-referencias.md](09-referencias.md) | Pronta |
| Apêndice A. Justificativas arquiteturais | [adr/](adr/) | Pronto |

## Como atualizar as telas da seção 8

Com a API e a interface rodando com os dados de demonstração:

```bash
uv run --no-project --python 3.12 --with playwright python docs/pdf/capturar_telas.py
```

As imagens são salvas em `imagens/` e entram no PDF na próxima geração.

## Apresentação

- [Slides em PDF](apresentacao/Apresentacao_Atletix.pdf) (14 slides, 16:9), gerados a partir de [apresentacao/slides.html](apresentacao/slides.html).
- [Roteiro](apresentacao/roteiro.md): fala por slide, demonstração passo a passo e perguntas prováveis.

Para regenerar os slides depois de editar o HTML:

```bash
uv run --no-project --python 3.12 --with playwright python docs/pdf/gerar_slides.py
```

## Decisões registradas (ADRs)

- [ADR-001 — Monólito modular particionado por domínio](adr/ADR-001-estilo-arquitetural.md)
- [ADR-002 — Stack NestJS + TypeScript e entrega como aplicação funcional](adr/ADR-002-stack-e-entrega.md)
- [ADR-003 — Camadas dentro de cada módulo](adr/ADR-003-camadas-dentro-dos-modulos.md)
- [ADR-004 — Separar Identidade, Autorização e Usuários](adr/ADR-004-identidade-autorizacao-e-usuarios.md)
- [ADR-005 — Estratégia de tokens e sessões](adr/ADR-005-tokens-e-sessoes.md)
- [ADR-006 — Eventos internos para efeitos colaterais](adr/ADR-006-eventos-internos.md)
