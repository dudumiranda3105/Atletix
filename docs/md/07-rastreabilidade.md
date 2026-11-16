# 7. Rastreabilidade entre documento e código — Atletix

Esta seção liga cada afirmação do documento ao arquivo em que ela pode ser conferida.

## 7.1 Módulos e requisitos

| Módulo | Requisitos | Onde a responsabilidade aparece |
|---|---|---|
| Identidade | RF01–RF06 | `identidade/aplicacao/entrar.ts` (login) e `identidade/aplicacao/servico-de-sessoes.ts` (sessões) |
| Autorização | RF07–RF09 | `autorizacao/dominio/politica-de-acesso.ts` (política) e `autorizacao/aplicacao/alterar-papel.ts` (regra do último administrador) |
| Usuários | RF10–RF11 | `usuarios/aplicacao/cadastrar-usuario.ts` e `usuarios/aplicacao/alterar-status-do-usuario.ts` |
| Matrículas | RF12–RF13 | `matriculas/dominio/matricula.ts` (validade) e `matriculas/aplicacao/consultar-situacao.ts` |
| Check-in | RF14–RF15 | `checkin/aplicacao/registrar-checkin.ts` e `checkin/aplicacao/consultar-checkins.ts` |
| Notificações | RF16 | `notificacoes/api/ouvinte-de-identidade.ts` (mensagens) e `notificacoes/infraestrutura/adaptadores.ts` (envio simulado) |
| Auditoria | RF17–RF18 | `auditoria/api/ouvinte-de-eventos.ts` e `auditoria/api/auditoria.controller.ts` |

## 7.2 Decisões de arquitetura

| Decisão | Documento | Onde está no código |
|---|---|---|
| Sete módulos em uma única aplicação | ADR-001, §2.4 | `backend/src/app.module.ts` |
| Camadas dentro de cada módulo | ADR-003, §3.2 | `backend/.dependency-cruiser.cjs` e `identidade/identidade.module.ts` |
| Identidade, Autorização e Usuários separados | ADR-004, §3.3 | `identidade/aplicacao/cadastrar-conta.ts` e `autorizacao/aplicacao/consultar-acesso.ts` |
| Módulos conversam por contratos | ADR-001, §5.2 | `usuarios/contratos/diretorio-de-usuarios.ts` e `matriculas/contratos/consulta-de-matriculas.ts` |
| Portas de segurança e guarda global | ADR-001, §5.2 | `compartilhado/seguranca/portas.ts` e `compartilhado/seguranca/guarda-de-seguranca.ts` |
| Permissões no contrato, política central | §5.2 | `checkin/contratos/permissoes.ts` e `autorizacao/dominio/politica-de-acesso.ts` |
| Eventos internos para efeitos colaterais | ADR-006, §5.2 | `compartilhado/eventos/publicador-em-memoria.ts` e `identidade/api/ouvinte-de-usuarios.ts` |
| Tabelas próprias por módulo | ADR-001, §5.2 | `checkin/infraestrutura/repositorio-de-checkins-typeorm.ts` |
| API NestJS e interface React | ADR-002 | `backend/package.json` e `frontend/package.json` |
| REST com validação de entrada e Swagger | ADR-002 | `identidade/api/dto.ts` e `backend/src/main.ts` |
| bcrypt e token de acesso preso à sessão | ADR-005 | `identidade/infraestrutura/adaptadores.ts` e `identidade/aplicacao/servico-de-sessoes.ts` |
| Sessão, status e papel conferidos a cada requisição | ADR-004, ADR-005, §1.5 | `identidade/aplicacao/autenticador-por-token.ts` e `autorizacao/aplicacao/consultar-acesso.ts` |
| Funções de aptidão e testes | ADR-001, §2.7 | `backend/.dependency-cruiser.cjs` e `backend/test/atletix.e2e-spec.ts` |

## 7.3 Conascência no código

| Exemplo da seção 6 | Arquivo e linha |
|---|---|
| C1 — Nome · reduzida | `usuarios/contratos/eventos.ts:17` declara o nome; `identidade/api/ouvinte-de-usuarios.ts:14` usa a constante |
| C2 — Tipo · mantida | `matriculas/contratos/consulta-de-matriculas.ts:13` define a interface; `checkin/aplicacao/registrar-checkin.ts:32` usa a resposta |
| C3 — Convenção · mantida | `frontend/src/compartilhado/api.ts:52` monta o cabeçalho; `compartilhado/seguranca/guarda-de-seguranca.ts:41` o interpreta |
| C4 — Posição · mantida | `identidade/contratos/eventos.ts:65` define a ordem; `identidade/aplicacao/trocar-senha.ts:46` cria o evento |
| C5 — Execução · reduzida | `compartilhado/seguranca/guarda-de-seguranca.ts:29` autentica, e só depois a linha 33 confere a permissão |
| C6 — Temporal · mantida | `identidade/dominio/token-de-recuperacao.ts:15` calcula o vencimento; `identidade/aplicacao/redefinir-senha.ts:37` o confere |
| C7 — Valor · eliminada | `identidade/infraestrutura/adaptadores.ts:49` grava só os identificadores no token; `autorizacao/aplicacao/consultar-acesso.ts:23` lê o papel atual |

## 7.4 Pontos de atenção

- **Cadastro de funcionários (RF10).** São duas operações: a Identidade cria a conta com o papel padrão `ALUNO`, e depois o administrador atribui o papel na Autorização.
- **Eventos "assíncronos".** Quem publica não espera por quem assina, mas a entrega é em memória, no mesmo processo. Os limites estão na seção 5.2.
- **Evolução (seção 2.8).** São possibilidades futuras. A troca por PostgreSQL não foi testada: as colunas `datetime` precisariam de ajuste. Ver `backend/src/app.module.ts`.
