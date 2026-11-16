# ADR-003 — Camadas dentro de cada módulo

- **Status:** Aceita
- **Data:** 15/11/2026
- **Relacionada a:** [ADR-001](ADR-001-estilo-arquitetural.md)

## Contexto

O ADR-001 dividiu o sistema por domínio. Faltava decidir como organizar o código dentro de cada módulo. As regras de autenticação (bloqueio de conta, validade de sessão, força de senha) são a parte mais sensível do sistema e precisam ser testadas sem banco de dados e sem servidor HTTP. Também queremos poder trocar tecnologia, como o algoritmo de hash ou o banco, sem reescrever essas regras.

## Decisão

Todo módulo tem as mesmas cinco pastas, com as dependências apontando para o domínio:

| Pasta | O que contém | Pode depender de |
|---|---|---|
| `api/` | Rotas HTTP, DTOs e ouvintes de eventos | `aplicacao/`, `dominio/`, `contratos/` |
| `aplicacao/` | Casos de uso | `dominio/`, `contratos/` |
| `dominio/` | Entidades, regras e portas (interfaces) | Nada do framework |
| `infraestrutura/` | Banco de dados, hash, tokens, e-mail | `dominio/` |
| `contratos/` | O que outros módulos podem usar | Nada interno do módulo |

O domínio declara **portas**, e a infraestrutura as implementa. A ligação entre as duas é feita por injeção de dependências no arquivo `<módulo>.module.ts`.

## Consequências

**Positivas**

- As regras do domínio são testadas com dublês das portas. Exemplo: `identidade/dominio/credencial.spec.ts` testa o bloqueio de conta sem banco.
- Trocar bcrypt por argon2, ou SQLite por outro banco, altera só arquivos de `infraestrutura/`.
- Quem conhece um módulo conhece a organização de todos.

**Negativas / riscos**

- Mais arquivos por funcionalidade. Cada entidade tem a classe de domínio, o modelo do banco e a conversão entre os dois.
- Em módulos simples, como Auditoria, a estrutura completa é mais do que o necessário hoje. Mantivemos pela consistência.
- Sem verificação automática, as camadas se misturam com o tempo.

## Conformidade (como verificar)

Regras de `backend/.dependency-cruiser.cjs`, executadas por `npm run arquitetura`:

- `dominio-sem-framework`: o domínio não importa NestJS, TypeORM nem as outras camadas.
- `aplicacao-nao-conhece-api-nem-infraestrutura`: os casos de uso dependem das portas, nunca dos adaptadores.
- `api-nao-acessa-infraestrutura`: rotas e ouvintes passam pelos casos de uso.
- `contrato-nao-expoe-detalhes-internos`: o contrato não depende das camadas internas.

## Alternativas consideradas

| Alternativa | Motivo da rejeição |
|---|---|
| Sem camadas: o modelo do banco é a própria entidade | Menos arquivos, mas as regras de segurança passam a depender do TypeORM e exigem banco nos testes |
| Camadas no nível do sistema (`controllers/`, `services/`) | Rejeitada no ADR-001: mudanças de negócio atravessam todas as pastas |
| Arquitetura hexagonal completa, com portas de entrada e de saída | Mais abstração do que o tamanho do sistema pede; ficamos só com as portas de saída |
