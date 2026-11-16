# ADR-002 — Stack NestJS + TypeScript e entrega como aplicação funcional

- **Status:** Aceita
- **Data:** 12/11/2026
- **Relacionada a:** [ADR-001](ADR-001-estilo-arquitetural.md)

## Contexto

O enunciado permite entregar um protótipo arquitetural ou uma aplicação funcional, que substitui o protótipo. A tecnologia **não** é critério de avaliação, mas o critério C (3,0 pts) avalia se o código **evidencia** os módulos, a coesão, o baixo acoplamento e a consistência com a documentação. A equipe domina Node.js e TypeScript.

## Decisão

1. **Entregar uma aplicação funcional**, com o fluxo completo de autenticação e autorização e os demais módulos implementados de forma parcial.
2. **Stack:**

| Camada | Escolha | Motivo arquitetural |
|---|---|---|
| Linguagem | TypeScript | Interfaces e tipos tornam os contratos entre módulos explícitos e verificáveis pelo compilador (conascência de tipo detectada em tempo de compilação) |
| Framework (API) | NestJS 11 | Módulos com `imports`/`exports` explícitos (fronteiras), injeção de dependências nativa (baixo acoplamento) e guarda global (segurança em um único ponto) |
| Eventos internos | `@nestjs/event-emitter` | Comunicação assíncrona entre módulos sem infraestrutura externa |
| Persistência | TypeORM + SQLite (`better-sqlite3`) | Modelos e repositórios por módulo; o SQLite roda sem servidor, o que facilita a apresentação offline. Uma troca por PostgreSQL fica restrita à configuração da conexão e aos tipos de coluna dos modelos, porque os casos de uso dependem só das portas dos repositórios |
| Tokens | JWT (acesso, 15 min) + token de renovação opaco, guardado como hash | O JWT leva só os ids do usuário e da sessão. Papel, status da conta e validade da sessão são lidos a cada requisição, então logout, troca de senha, desativação e troca de papel valem na requisição seguinte. O segredo de assinatura nunca fica no código: sem configuração, é sorteado a cada inicialização. O detalhamento fica em ADR próprio |
| Hash de senha | bcrypt (`bcryptjs`, via adaptador) | Algoritmo isolado atrás de uma interface; trocar por argon2 afeta só a Identidade |
| Interface web | React + Vite + Tailwind CSS (animações com Motion, fontes Barlow embutidas) | Aplicação separada que consome a API REST; a pasta `funcionalidades/` espelha os módulos do backend. Não conhece regras de negócio: só mostra o que a API responde |
| Documentação da API | Swagger (`@nestjs/swagger`) | Contrato HTTP navegável em `/api/docs` |
| Testes | Jest + Supertest | Testes unitários dos casos de uso (com dublês dos contratos) e de ponta a ponta das rotas |
| Arquitetura como código | dependency-cruiser | Função de aptidão para as fronteiras entre módulos (ADR-001) |

## Consequências

**Positivas**

- O framework reforça a arquitetura: módulos, DI e guards mapeiam diretamente nos conceitos de coesão e acoplamento.
- Fica fácil mostrar a rastreabilidade documento ↔ código (cada módulo do documento é um `*.module.ts`).
- A apresentação roda com `npm install` + `npm run start`, sem banco externo.

**Negativas / riscos**

- O NestJS tem curva de aprendizado (decorators, DI) para quem não o conhece.
- Risco de "acoplamento ao framework" no domínio. Mitigação: `dominio/` não importa `@nestjs/*` (regra de conformidade da ADR-001).
- O SQLite não representa produção (concorrência). Isso é aceitável no contexto acadêmico e a troca é só de configuração.

## Alternativas consideradas

| Alternativa | Motivo da rejeição |
|---|---|
| Protótipo arquitetural (sem funcionalidade completa) | Menos evidência para o critério C |
| Express puro | Exigiria construir manualmente módulos, DI e guards; mais código de infraestrutura e menos foco em arquitetura |
| PostgreSQL via Docker | Dependência extra na apresentação; fica como configuração de produção |
