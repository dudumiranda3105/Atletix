# 7. Rastreabilidade entre documento e código — Atletix

## 7.1 Fronteiras e coesão dos módulos

Cada linha liga a responsabilidade da seção 3 e a classificação da seção 4 à montagem do módulo e a uma regra ou fluxo que evidencia seu propósito.

| Decisão | Montagem e evidência |
|---|---|
| Identidade concentra credenciais, login e sessões (§3–4, RF01–RF06). | `backend/src/modulos/identidade/identidade.module.ts` monta as portas e os casos de uso. `backend/src/modulos/identidade/aplicacao/entrar.ts` liga credencial, status e emissão de sessão. |
| Autorização concentra papéis e permissões (§3–4, RF07–RF09). | `backend/src/modulos/autorizacao/autorizacao.module.ts` fornece `AUTORIZADOR`. `backend/src/modulos/autorizacao/dominio/politica-de-acesso.ts` define a política e `backend/src/modulos/autorizacao/aplicacao/alterar-papel.ts` verifica a existência de outro administrador ativo ao trocar o papel de um administrador. |
| Usuários é dono do cadastro e do status da conta (§3–4, RF10–RF11). | `backend/src/modulos/usuarios/usuarios.module.ts` exporta o diretório. `backend/src/modulos/usuarios/aplicacao/cadastrar-usuario.ts` grava o cadastro e `backend/src/modulos/usuarios/aplicacao/alterar-status-do-usuario.ts` grava o status e publica o evento. |
| Matrículas é dona do plano, da validade e do cálculo da situação (§3–4, RF12–RF13). | `backend/src/modulos/matriculas/matriculas.module.ts` exporta a consulta. `backend/src/modulos/matriculas/dominio/matricula.ts` calcula a validade e `backend/src/modulos/matriculas/aplicacao/consultar-situacao.ts` retorna a situação. |
| Check-in decide a entrada e mantém o histórico (§3–4, RF14–RF15). | `backend/src/modulos/checkin/checkin.module.ts` reúne os casos de uso. `backend/src/modulos/checkin/aplicacao/registrar-checkin.ts` aplica as condições de entrada e `backend/src/modulos/checkin/aplicacao/consultar-checkins.ts` lista as entradas. |
| Notificações concentra conteúdo, caixa de saída e envio simulado (§3–4, RF16). | `backend/src/modulos/notificacoes/notificacoes.module.ts` liga a porta de envio ao adaptador simulado. `backend/src/modulos/notificacoes/api/ouvinte-de-identidade.ts` monta as mensagens. |
| Auditoria concentra a seleção, gravação e consulta dos registros (§3–4, RF17–RF18). | `backend/src/modulos/auditoria/auditoria.module.ts` monta o módulo. `backend/src/modulos/auditoria/api/ouvinte-de-eventos.ts` seleciona os campos e `backend/src/modulos/auditoria/api/auditoria.controller.ts` expõe a consulta protegida. |

## 7.2 Estratégias de acoplamento e ADRs

| Decisão | Onde está aplicada |
|---|---|
| Monólito modular com camadas internas (ADR-001, §2–3). | `backend/src/main.ts` inicializa o backend com `AppModule`. `backend/src/app.module.ts` compõe os sete módulos, cujas montagens constam na §7.1. |
| Contratos síncronos locais (ADR-001, §5.1–5.2). | `backend/src/modulos/usuarios/contratos/diretorio-de-usuarios.ts` e `backend/src/modulos/matriculas/contratos/consulta-de-matriculas.ts` definem as consultas. `backend/src/modulos/checkin/aplicacao/registrar-checkin.ts` usa ambas. A tabela de evidências da §5.1 cobre os demais vínculos da matriz. |
| Injeção por portas e guarda global (ADR-001 e ADR-002, §5.2). | `backend/src/compartilhado/seguranca/portas.ts` define as portas. `backend/src/modulos/identidade/identidade.module.ts` e `backend/src/modulos/autorizacao/autorizacao.module.ts` exportam os provedores. `backend/src/app.module.ts` registra o guarda que os usa. |
| Permissões expostas por contrato e política centralizada (§5.2). | `backend/src/modulos/checkin/contratos/permissoes.ts` declara nomes usados em `backend/src/modulos/checkin/api/checkin.controller.ts`. `backend/src/modulos/autorizacao/dominio/politica-de-acesso.ts` atribui as permissões aos papéis. |
| Eventos internos para reações desacopladas (ADR-001 e ADR-002, §5.2). | `backend/src/compartilhado/nucleo.module.ts` fornece o publicador e `backend/src/compartilhado/eventos/publicador-em-memoria.ts` despacha com `emit`. `backend/src/modulos/usuarios/aplicacao/alterar-status-do-usuario.ts` publica a desativação e `backend/src/modulos/identidade/api/ouvinte-de-usuarios.ts` trata a revogação. |
| SQLite compartilhado com tabelas próprias por módulo (ADR-001 e ADR-002, §5.2). | `backend/src/app.module.ts` configura TypeORM com `better-sqlite3`. `backend/src/modulos/checkin/infraestrutura/repositorio-de-checkins-typeorm.ts` acessa a tabela de check-ins e `backend/src/modulos/checkin/aplicacao/consultar-checkins.ts` usa o diretório para nomes. |
| Aplicação funcional em TypeScript, com API NestJS e interface React, Vite e Tailwind (ADR-002). | `backend/package.json` e `frontend/package.json` declaram as dependências. `backend/src/main.ts` inicializa a API, `frontend/src/main.tsx` monta a interface e `frontend/src/index.css` importa o Tailwind. |
| REST com validação de entrada e Swagger (ADR-002, §5.2). | `backend/src/app.module.ts` configura prefixo e validação. `backend/src/modulos/identidade/api/dto.ts` define os DTOs e `backend/src/main.ts` publica o Swagger. `frontend/src/compartilhado/api.ts` faz as requisições. |
| bcrypt, JWT de acesso vinculado à sessão e renovação por token opaco (ADR-002). | `backend/src/modulos/identidade/infraestrutura/adaptadores.ts` implementa o bcrypt e o JWT com os identificadores do usuário e da sessão. `backend/src/modulos/identidade/aplicacao/servico-de-sessoes.ts` persiste a sessão com o hash do token de renovação. |
| Consulta de sessão, status da conta e papel atual no servidor (ADR-002, §1–2). | `backend/src/modulos/identidade/aplicacao/autenticador-por-token.ts` verifica sessão e status. `backend/src/modulos/identidade/aplicacao/servico-de-sessoes.ts` determina se a sessão ainda vale. `backend/src/modulos/autorizacao/aplicacao/consultar-acesso.ts` lê o papel atual quando avalia a permissão exigida. |
| Funções de aptidão e testes de comportamento (ADR-001 e ADR-002, §2.7 e §5.3). | `backend/.dependency-cruiser.cjs` verifica imports e ciclos entre arquivos, incluindo dependências de tipo. `backend/package.json` reúne os comandos. `backend/src/modulos/checkin/aplicacao/registrar-checkin.spec.ts` usa dublês dos contratos e `backend/test/atletix.e2e-spec.ts` verifica fluxos como 401/403, mudança de papel, desativação e recuperação. |

## 7.3 Conascência no código

| Exemplo da §6 | Arquivo e linha |
|---|---|
| C1 — Nome · reduzida | `backend/src/modulos/usuarios/contratos/eventos.ts:17` declara o nome e `backend/src/modulos/identidade/api/ouvinte-de-usuarios.ts:14` usa a mesma constante. |
| C2 — Tipo · mantida | `backend/src/modulos/matriculas/contratos/consulta-de-matriculas.ts:13` define a interface e `backend/src/modulos/checkin/aplicacao/registrar-checkin.ts:32` consome a resposta. |
| C3 — Convenção · mantida | `frontend/src/compartilhado/api.ts:52` monta o cabeçalho e `backend/src/compartilhado/seguranca/guarda-de-seguranca.ts:41` interpreta o esquema. |
| C4 — Posição · mantida | `backend/src/modulos/identidade/contratos/eventos.ts:65` define a ordem e `backend/src/modulos/identidade/aplicacao/trocar-senha.ts:46` constrói o evento. |
| C5 — Execução · reduzida | `backend/src/compartilhado/seguranca/guarda-de-seguranca.ts:29` autentica antes da verificação da linha 33. |
| C6 — Temporal · mantida | `backend/src/modulos/identidade/dominio/token-de-recuperacao.ts:15` calcula a expiração e `backend/src/modulos/identidade/aplicacao/redefinir-senha.ts:37` verifica a validade antes da troca. |
| C7 — Valor · eliminada | `backend/src/modulos/identidade/infraestrutura/adaptadores.ts:49` grava no token só os identificadores do usuário e da sessão, e `backend/src/modulos/autorizacao/aplicacao/consultar-acesso.ts:23` lê o papel atual a cada verificação. |

## 7.4 Pontos de atenção na leitura do escopo e dos ADRs

- O RF10 é atendido por duas operações. Identidade oferece o cadastro público e Autorização define o papel padrão `ALUNO` e a operação administrativa de atribuição de papel. Usuários mantém as consultas cadastrais e o status das contas. Ver `backend/src/modulos/identidade/api/auth.controller.ts`, `backend/src/modulos/autorizacao/dominio/politica-de-acesso.ts`, `backend/src/modulos/autorizacao/api/autorizacao.controller.ts` e `backend/src/modulos/usuarios/api/usuarios.controller.ts`.
- A expressão **eventos assíncronos** na §2 e nos ADRs descreve reações cujo término o produtor não aguarda. A implementação usa `emit` em memória e a regra de ciclos analisa arquivos. As limitações do despacho e o ciclo no grafo agregado aparecem nas §5.2–5.3. Ver `backend/src/compartilhado/eventos/publicador-em-memoria.ts` e `backend/.dependency-cruiser.cjs`.
- Os cenários de evolução da §2.8 são possibilidades futuras. A troca por PostgreSQL, citada no ADR-002, ainda precisa ser validada. O código atual configura SQLite, usa o driver `better-sqlite3` e declara colunas `datetime` em modelos como o de Matrículas. Ver `backend/src/app.module.ts`, `backend/package.json` e `backend/src/modulos/matriculas/infraestrutura/repositorio-de-matriculas-typeorm.ts`.
