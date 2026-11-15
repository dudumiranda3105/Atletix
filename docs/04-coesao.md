# 4. Análise de coesão — Atletix

## 4.1 O que foi analisado

Para Richards e Ford, **coesão** expressa quanto as partes de um módulo pertencem juntas. Na **coesão funcional**, elas colaboram para um propósito definido. A classificação aqui é do **módulo de domínio inteiro**. Uma sequência de passos ou o uso dos mesmos dados ajuda a explicar um caso de uso, mas a classificação do módulo depende do propósito que une seus casos de uso. [Richards e Ford, cap. 3, Modularidade](https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/ch03.html).

A escala também distingue agrupamentos **sequenciais** (uma etapa alimenta a próxima), **comunicacionais** (operações compartilham dados), **procedurais** (seguem um procedimento), **temporais** (acontecem no mesmo momento), **lógicos** (pertencem à mesma categoria de operação) e **coincidentais** (foram reunidos por conveniência). Os contraexemplos abaixo mostram o que se perderia ao agrupar partes do Atletix por outro critério.

## 4.2 Tipo predominante por módulo

### Identidade — funcional

A credencial controla tentativas de senha, o login verifica a credencial e o serviço de sessões abre ou revoga sessões. Esses elementos tratam da mesma pergunta, **quem pode provar sua identidade e manter uma sessão?** Uma mudança no bloqueio se concentra na credencial e no fluxo de login. O contraexemplo seria repetir a conferência de senha e o bloqueio dentro das rotas de check-in e matrícula.

**Evidência** em `backend/src/modulos/identidade/dominio/credencial.ts`, `backend/src/modulos/identidade/aplicacao/entrar.ts` e `backend/src/modulos/identidade/aplicacao/servico-de-sessoes.ts`.

### Autorização — funcional

A alteração de papel mantém a atribuição, a política relaciona papéis e permissões e a consulta usa ambos para decidir o acesso. O propósito comum é **controlar o que cada pessoa pode fazer**. Uma alteração de permissão pode ser feita na política. O contraexemplo seria manter em cada controller uma lista independente de papéis aceitos.

**Evidência** em `backend/src/modulos/autorizacao/aplicacao/alterar-papel.ts`, `backend/src/modulos/autorizacao/dominio/politica-de-acesso.ts` e `backend/src/modulos/autorizacao/aplicacao/consultar-acesso.ts`.

### Usuários — funcional

A entidade normaliza os dados da pessoa, os casos de uso cadastram e alteram seu status, e o diretório oferece consultas sobre esse mesmo cadastro. Uma mudança na normalização de e-mail tem ponto definido no domínio. O contraexemplo seria usar uma única classe de cadastro para guardar dados pessoais, hash de senha e atribuições de papel.

**Evidência** em `backend/src/modulos/usuarios/dominio/usuario.ts`, `backend/src/modulos/usuarios/aplicacao/cadastrar-usuario.ts`, `backend/src/modulos/usuarios/aplicacao/alterar-status-do-usuario.ts` e `backend/src/modulos/usuarios/aplicacao/diretorio-de-usuarios-local.ts`.

### Matrículas — funcional

A entidade calcula a validade pelo plano, o registro encadeia uma renovação ao fim da vigência anterior e a consulta procura uma matrícula ativa. Os três sustentam **a vigência do vínculo do aluno**. O contraexemplo seria recalcular as datas de cada plano também no Check-in, duplicando a regra a cada mudança de duração.

**Evidência** em `backend/src/modulos/matriculas/dominio/matricula.ts`, `backend/src/modulos/matriculas/aplicacao/registrar-matricula.ts` e `backend/src/modulos/matriculas/aplicacao/consultar-situacao.ts`.

### Check-in — funcional

O registro verifica as condições de entrada e a duplicidade no dia. A consulta recupera o histórico e as entradas do dia, usando o mesmo conceito de intervalo diário do domínio. Uma alteração na definição do dia tem um ponto comum para os dois casos de uso. O contraexemplo seria colocar a regra de duplicidade no módulo Matrículas, agrupando operações apenas por serem atividades da academia.

**Evidência** em `backend/src/modulos/checkin/aplicacao/registrar-checkin.ts`, `backend/src/modulos/checkin/aplicacao/consultar-checkins.ts` e `backend/src/modulos/checkin/dominio/checkin.ts`.

### Notificações — funcional

O ouvinte monta o conteúdo, o serviço registra a mensagem na caixa de saída e a entrega passa pela porta de e-mail. O propósito comum é **comunicar o fato ao destinatário**. Templates e envio ficam na fronteira de Notificações. O contraexemplo seria montar o texto e invocar o enviador diretamente nos casos de uso de senha.

**Evidência** em `backend/src/modulos/notificacoes/api/ouvinte-de-identidade.ts`, `backend/src/modulos/notificacoes/aplicacao/servico-de-notificacoes.ts` e `backend/src/modulos/notificacoes/infraestrutura/adaptadores.ts`.

### Auditoria — funcional

O ouvinte seleciona os dados de cada evento, o serviço grava o registro e a consulta recupera a trilha. Mesmo com eventos de cinco origens, todos esses elementos servem à **reconstituição das ações do sistema**. Uma mudança nos dados registrados pode ser feita no ouvinte. O contraexemplo seria cada produtor montar e gravar suas próprias linhas da tabela de auditoria.

**Evidência** em `backend/src/modulos/auditoria/api/ouvinte-de-eventos.ts`, `backend/src/modulos/auditoria/aplicacao/servico-de-auditoria.ts` e `backend/src/modulos/auditoria/infraestrutura/repositorio-de-registros-typeorm.ts`.
