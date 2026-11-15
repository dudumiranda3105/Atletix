# Documentação arquitetural — Atletix

Rascunhos das seções que vão compor o documento final enviado ao professor.

**PDF atual:** [Documentacao_Arquitetura_Atletix.pdf](Documentacao_Arquitetura_Atletix.pdf)

## Como regenerar o PDF

Os `.md` são a fonte; o PDF é gerado a partir deles (capa, sumário com páginas, diagramas Mermaid e ADRs no apêndice). Na pasta do projeto:

```bash
uv run --no-project --python 3.12 --with markdown --with playwright --with pymupdf python docs/pdf/gerar_pdf.py
```

Requer Chrome ou Edge instalado e internet (para os diagramas). Para incluir uma nova seção, nomes do trio, link do repositório ou mudar a versão, edite as constantes no topo de [pdf/gerar_pdf.py](pdf/gerar_pdf.py).

| Seção | Arquivo | Status |
|---|---|---|
| 1. Descrição do problema e escopo | [01-escopo-e-problema.md](01-escopo-e-problema.md) | Em revisão |
| 2. Estilo arquitetural e trade-offs | [02-estilo-arquitetural.md](02-estilo-arquitetural.md) | Em revisão |
| 3. Módulos e responsabilidades | [03-modulos.md](03-modulos.md) | Em revisão |
| 4. Análise de coesão | [04-coesao.md](04-coesao.md) | Em revisão |
| 5. Análise de acoplamento | [05-acoplamento.md](05-acoplamento.md) | Em revisão |
| 6. Análise de conascência | [06-conascencia.md](06-conascencia.md) | Em revisão |
| 7. Rastreabilidade entre documento e código | [07-rastreabilidade.md](07-rastreabilidade.md) | Em revisão |
| Apêndice A. Justificativas arquiteturais | [adr/](adr/) | Em andamento |

## Decisões registradas (ADRs)

- [ADR-001 — Monólito modular particionado por domínio](adr/ADR-001-estilo-arquitetural.md)
- [ADR-002 — Stack NestJS + TypeScript e entrega como aplicação funcional](adr/ADR-002-stack-e-entrega.md)
