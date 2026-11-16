# Atletix

Sistema de gestão de academias com foco em **controle de autenticação**.
Trabalho da disciplina **Arquitetura de Software** (Uni-FACEF, 6º semestre, Prof. Carlos Alberto Lucas).

**Equipe:** Eduarda Roberta Borges da Silva · Eduardo de Miranda · Rebeca Lucio Souza Chagas

O objetivo do projeto é demonstrar **coesão**, **acoplamento** e **conascência** na prática, com base em
*Fundamentos da Arquitetura de Software* (Richards e Ford). A documentação arquitetural está em
[docs/Documentacao_Arquitetura_Atletix.pdf](docs/Documentacao_Arquitetura_Atletix.pdf).

## O que o sistema faz

| Perfil | O que faz no sistema |
|---|---|
| Administrador | Gerencia usuários, altera perfis, ativa e desativa contas, consulta a auditoria |
| Recepção | Cadastra alunos, registra matrículas, acompanha os check-ins do dia |
| Instrutor | Consulta alunos e matrículas (somente leitura) |
| Aluno | Faz check-in, consulta a própria matrícula, troca a senha |

Recursos de autenticação: login com bloqueio após 5 senhas erradas, sessão que se renova com rotação de
token, logout, troca e recuperação de senha, e perda imediata de acesso quando a conta é desativada.

## Arquitetura em uma página

**Monólito modular particionado por domínio** ([ADR-001](docs/adr/ADR-001-estilo-arquitetural.md)).
Cada módulo tem uma responsabilidade e só conversa com os outros por **contratos** (chamadas síncronas)
ou **eventos** (efeitos colaterais).

| Módulo | Responsabilidade | Depende de (contrato) | Eventos |
|---|---|---|---|
| `identidade` | Quem é o usuário: senha, tokens, sessões | `usuarios` | publica 7, assina `UsuarioDesativado` |
| `autorizacao` | O que ele pode fazer: papéis e política de permissões | `usuarios` | publica `PapelAlterado` |
| `usuarios` | Cadastro das pessoas e status da conta | — | publica 3 |
| `matriculas` | Plano e validade da matrícula | `usuarios` | publica `MatriculaRegistrada` |
| `checkin` | Entrada do aluno na academia | `usuarios`, `matriculas` | publica 2 |
| `notificacoes` | E-mails (envio simulado, adaptador trocável) | — | assina eventos da `identidade` |
| `auditoria` | Trilha de eventos de segurança | — | assina eventos de todos |

Dentro de cada módulo:

```text
backend/src/modulos/<modulo>/
├── api/              entradas: controllers HTTP, DTOs e ouvintes de eventos
├── aplicacao/        casos de uso
├── dominio/          entidades, regras e portas (sem framework)
├── infraestrutura/   adaptadores: TypeORM, bcrypt, JWT, e-mail
├── contratos/        a única parte que outros módulos podem importar
└── <modulo>.module.ts
```

O que não pertence a nenhum módulo fica em `backend/src/compartilhado/` (erros de domínio, eventos,
relógio e o guarda de segurança).

### Onde ver cada conceito no código

| Conceito | Onde olhar |
|---|---|
| Fronteiras entre módulos | `exports` de cada `*.module.ts` (só o contrato sai) e `backend/.dependency-cruiser.cjs` |
| Contrato entre módulos | `modulos/usuarios/contratos/diretorio-de-usuarios.ts`, usado por Identidade, Autorização, Matrículas e Check-in |
| Comunicação por eventos | `modulos/usuarios/aplicacao/alterar-status-do-usuario.ts` publica; `modulos/identidade/api/ouvinte-de-usuarios.ts` reage |
| Inversão de dependência | `compartilhado/seguranca/portas.ts` (portas) implementadas por Identidade e Autorização |
| Domínio sem framework | qualquer pasta `dominio/`, por exemplo `modulos/identidade/dominio/credencial.ts` |
| Política de acesso em um lugar só | `modulos/autorizacao/dominio/politica-de-acesso.ts` |
| Teste com dublês dos contratos | `modulos/checkin/aplicacao/registrar-checkin.spec.ts` |

## Como rodar

Requisitos: **Node.js 22 ou superior**.

**1. API (backend)**

```bash
cd backend
npm install
cp .env.example .env
npm run semente
npm run start
```

A API fica em http://localhost:3000/api e a documentação interativa (Swagger) em http://localhost:3000/api/docs.

**2. Interface (frontend)**, em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra http://localhost:5173.

### Contas de demonstração

O comando `npm run semente` cria uma conta por perfil, mais cinco alunos com matrícula ativa e seis semanas de histórico de treinos, para o painel e os gráficos não aparecerem vazios. Todas as contas usam a senha definida em `SEMENTE_SENHA`
no arquivo [backend/.env.example](backend/.env.example).

| Perfil | E-mail |
|---|---|
| Administrador | `admin@atletix.dev` |
| Recepção | `recepcao@atletix.dev` |
| Instrutor | `instrutor@atletix.dev` |
| Aluno com matrícula ativa e histórico de treinos | `aluna@atletix.dev` |
| Aluno sem matrícula | `aluno.sem.matricula@atletix.dev` |

### Roteiro de demonstração

1. Entrar como **aluna** e fazer check-in. Tentar de novo: o sistema aceita um por dia.
2. Entrar como **aluno sem matrícula** e tentar o check-in: negado pela regra de matrícula.
3. Entrar como **recepção**, registrar a matrícula desse aluno e ver os check-ins do dia.
4. Entrar como **aluna** e abrir `/usuarios` pela barra de endereço: acesso negado (403 no servidor).
5. Entrar como **administrador**, promover um usuário e desativar outro. A conta desativada perde o
   acesso na requisição seguinte.
6. Na tela de login, usar "Esqueci minha senha". O e-mail aparece em **Caixa de saída** (administrador).
7. Abrir **Auditoria** e mostrar que tudo acima foi registrado, sem nenhum módulo chamar a auditoria.

## Testes e verificação da arquitetura

Na pasta `backend`:

```bash
npm run verificar
```

Esse comando roda, em sequência:

| Comando | O que verifica |
|---|---|
| `npm run arquitetura` | Regras de dependência entre módulos e camadas (funções de aptidão) |
| `npm test` | Testes unitários de domínio e casos de uso, com dublês dos contratos |
| `npm run test:e2e` | Cenários de ponta a ponta com a aplicação inteira e banco em memória |

### O que os testes garantem sobre a autenticação

| Garantia | Como é verificada |
|---|---|
| Toda rota exige login, exceto seis rotas públicas conhecidas | O teste lista as rotas da própria aplicação e chama cada uma sem token |
| Token forjado, adulterado, sem assinatura, expirado ou de outra sessão é recusado | Seis tentativas de ataque no teste "resistência a ataques" |
| Logout, renovação, troca de senha e desativação cortam o acesso na requisição seguinte | O token de acesso é preso à sessão, que é conferida a cada requisição |
| Cada perfil só faz o que a política permite | Matriz de 4 perfis contra as ações sensíveis, esperando 403 |
| Ninguém escolhe o próprio perfil no cadastro, nem rebaixa o último administrador | Testes de cadastro e de troca de papel |
| Só o link de recuperação mais recente vale, uma única vez | Teste com três links pedidos em sequência |
| Cinco senhas erradas bloqueiam a conta por 15 minutos | Teste de bloqueio |
| Uma falha em quem assina um evento não derruba quem publica | Teste do barramento de eventos |

## Estrutura do repositório

```text
Atletix/
├── backend/     API NestJS + TypeORM + SQLite
├── frontend/    Interface React + Vite + Tailwind CSS
└── docs/        Documentação arquitetural (fontes em Markdown, ADRs e PDF)
```

## Limitações conhecidas

- O envio de e-mail é simulado: as mensagens ficam na caixa de saída do administrador. Isso inclui os
  links de recuperação de senha, então a caixa de saída precisa ser desligada quando houver e-mail de verdade.
- Não há limite de requisições por endereço IP. O bloqueio por conta protege contra adivinhação de senha,
  mas um limite por IP (por exemplo com `@nestjs/throttler`) seria necessário em produção.
- O banco é SQLite com criação automática de tabelas; em produção seriam usadas migrations e PostgreSQL.
- O token de renovação fica no `localStorage` do navegador. Em produção, um cookie `HttpOnly` é mais seguro.
- MFA, login social e múltiplas unidades estão fora do escopo e descritos como evolução na documentação.
