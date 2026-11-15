# 1. Descrição do problema e escopo — Atletix

> **Sistema:** A4 — Sistema de Gestão de Academias · **Recorte:** Controle de Autenticação
> **Disciplina:** Arquitetura de Software — Prof. Carlos Alberto Lucas — Uni-FACEF, 6º semestre
> **Equipe:** Eduarda Roberta Borges da Silva · Eduardo de Miranda · Rebeca Lucio Souza Chagas
> **Repositório:** https://github.com/dudumiranda3105/Atletix

## 1.1 Contexto

Uma academia tem pessoas com necessidades bem diferentes usando o mesmo sistema: a **recepção** cadastra alunos e libera a entrada, os **instrutores** consultam alunos, o **administrador** gerencia funcionários e permissões, e o **aluno** acessa os próprios dados e faz check-in.

Em todos esses fluxos aparecem as mesmas perguntas: **quem é esta pessoa?** (autenticação) e **ela pode fazer isto?** (autorização). Por exemplo:

- o check-in só pode ser liberado para um aluno autenticado, com conta ativa e matrícula em dia;
- a tela de usuários só pode ser aberta por um administrador;
- quando um funcionário é desligado, os acessos dele precisam acabar na hora.

## 1.2 O problema

Quando a lógica de identidade fica **espalhada** pelas funcionalidades (cada tela verifica senha, sessão e perfil do seu jeito), surgem três problemas:

1. **Mudanças em cascata (baixa manutenibilidade).** Trocar o algoritmo de hash de senha, mudar o tempo de sessão ou adicionar autenticação em dois fatores exige alterar vários pontos do sistema ao mesmo tempo.
2. **Falhas de segurança por inconsistência.** Se uma rota esquece de verificar o perfil, um aluno consegue executar uma operação administrativa. Se a desativação de conta não encerra as sessões, um ex-funcionário continua com acesso.
3. **Dificuldade de evolução.** Recursos como login social, MFA, múltiplas unidades ou um aplicativo móvel ficam caros, porque não existe um ponto único e estável que responda "quem é o usuário e o que ele pode fazer".

**Problema central:** projetar um subsistema de **Controle de Autenticação e Autorização** para a gestão de academias que seja **coeso** (identidade concentrada em módulos com responsabilidade clara), **pouco acoplado** (os outros módulos o usam por contratos, sem conhecer seus detalhes internos) e **preparado para evoluir**, demonstrado numa **aplicação funcional**.

## 1.3 Atores e perfis de acesso

| Perfil | Quem é | O que pode fazer (resumo) |
|---|---|---|
| `ADMIN` | Gestor da academia | Gerencia funcionários, papéis e status de contas; consulta a auditoria |
| `RECEPCAO` | Recepcionista | Cadastra alunos e matrículas, consulta status de matrícula e check-ins do dia |
| `INSTRUTOR` | Professor de musculação/aulas | Consulta dados básicos dos alunos (somente leitura) |
| `ALUNO` | Cliente da academia | Acessa a própria conta, troca a senha, consulta a matrícula e faz check-in |

> O cadastro público sempre cria uma conta `ALUNO`. Perfis de funcionário só podem ser atribuídos por um `ADMIN`.

## 1.4 Requisitos funcionais

O foco é o controle de autenticação. Os demais módulos são implementados **de forma parcial**, apenas o suficiente para **consumir** a identidade e demonstrar a comunicação e o baixo acoplamento entre módulos.

### Identidade (autenticação) — núcleo

| ID | Requisito |
|---|---|
| RF01 | Autenticar com e-mail e senha, emitindo um **token de acesso** de curta duração e um **token de renovação** |
| RF02 | Renovar a sessão com o token de renovação, com **rotação** (o token usado é invalidado) |
| RF03 | Encerrar a sessão (logout), revogando o token de renovação |
| RF04 | Trocar a senha, revogando **todas** as sessões ativas do usuário |
| RF05 | Recuperar a senha por um token de uso único com validade curta |
| RF06 | Bloquear temporariamente a conta após várias tentativas de login com falha |

### Autorização

| ID | Requisito |
|---|---|
| RF07 | Controlar o acesso por papéis (`ADMIN`, `RECEPCAO`, `INSTRUTOR`, `ALUNO`) e permissões |
| RF08 | Permitir que o `ADMIN` altere o papel de um usuário, sem nunca remover o último administrador |
| RF09 | Verificar a permissão **no servidor** em toda rota protegida |

### Usuários (cadastro)

| ID | Requisito |
|---|---|
| RF10 | Autocadastro de aluno; cadastro de funcionários pelo `ADMIN` |
| RF11 | Ativar e desativar contas; desativar encerra as sessões ativas |

### Matrículas (parcial)

| ID | Requisito |
|---|---|
| RF12 | Registrar a matrícula de um aluno com plano e data de validade |
| RF13 | Informar se a matrícula está ativa ou vencida |

### Check-in (parcial)

| ID | Requisito |
|---|---|
| RF14 | Registrar o check-in do aluno autenticado somente com **conta ativa** e **matrícula ativa** |
| RF15 | Listar os check-ins do dia para a recepção |

### Notificações e auditoria (parcial)

| ID | Requisito |
|---|---|
| RF16 | Enviar o link de recuperação de senha e o alerta de bloqueio de conta (envio **simulado**, com o adaptador de e-mail trocável) |
| RF17 | Registrar eventos de segurança: login com sucesso ou falha, bloqueio, troca de senha, troca de papel, desativação |
| RF18 | Permitir que o `ADMIN` consulte a trilha de auditoria |

## 1.5 Características arquiteturais

Seguindo Richards e Ford, a arquitetura deve ser guiada por **poucas** características prioritárias. Querer otimizar todas leva a uma arquitetura genérica e cara. Por isso escolhemos **três** prioritárias e deixamos as outras como secundárias, de forma consciente.

| Prioridade | Característica | Por que importa no Atletix |
|---|---|---|
| **1ª** | **Segurança** | É o motivo de o sistema existir: protege dados pessoais (LGPD) e operações administrativas |
| **2ª** | **Manutenibilidade / modularidade** | Mudanças na política de autenticação não podem se espalhar pelo sistema |
| **3ª** | **Evolutividade** | MFA, login social, várias unidades e aplicativo móvel são caminhos naturais do produto |
| Secundária | Testabilidade | Cada módulo precisa ser testado isoladamente para dar confiança às mudanças |
| Secundária | Auditabilidade | É preciso saber quem fez o quê, principalmente nas ações administrativas |
| Secundária | Escalabilidade / disponibilidade | Uma unidade com centenas de alunos e picos de check-in (6h–8h e 18h–20h). A demanda é **moderada** e não justifica infraestrutura distribuída agora |

### Cenários de qualidade (como vamos medir)

| Característica | Cenário verificável |
|---|---|
| Manutenibilidade | Trocar o algoritmo de hash de senha altera **somente** o módulo Identidade |
| Evolutividade | Adicionar MFA **não** exige mudanças nos módulos Check-in, Matrículas ou Usuários |
| Segurança | Uma conta desativada perde o acesso na **próxima** requisição; o aluno recebe **403** em rotas administrativas |
| Modularidade | Nenhum módulo importa classes internas ou tabelas de outro (verificado automaticamente no código) |
| Testabilidade | Os casos de uso de cada módulo são testados com dublês (mocks) dos contratos dos outros módulos |

## 1.6 Restrições

- **Prazo:** 12/11 a 26/11/2026 (duas semanas), com uma equipe de três pessoas.
- **Entrega:** aplicação funcional, documentação arquitetural e repositório no GitHub.
- **Tecnologia:** NestJS (API) e React (interface web), ambos em TypeScript. A tecnologia não é critério de avaliação; foi escolhida pelo domínio da equipe.
- **Apresentação:** a aplicação precisa rodar localmente e **sem depender de internet** no dia 26/11.

## 1.7 Fora do escopo

- Pagamentos reais, gateway de cobrança e emissão de notas.
- Treinos, avaliação física e agenda de aulas.
- Integração com catraca física (o check-in é feito pela aplicação).
- MFA, SSO e login social: ficam como **evolução prevista**; a arquitetura deve permitir adicioná-los sem retrabalho.
- Envio real de e-mail: usamos um adaptador que registra a mensagem localmente e pode ser trocado por SMTP.
- Várias unidades (filiais) e aplicativo móvel.

## 1.8 Glossário

| Termo | Significado |
|---|---|
| Autenticação | Confirmar **quem** é o usuário (credenciais → identidade) |
| Autorização | Decidir **o que** o usuário autenticado pode fazer (papéis e permissões) |
| Token de acesso | Credencial de curta duração enviada em cada requisição |
| Token de renovação | Credencial de longa duração, usada apenas para obter um novo token de acesso |
| Matrícula ativa | Vínculo do aluno com um plano cuja validade ainda não venceu |
| Check-in | Registro da entrada do aluno na academia |
