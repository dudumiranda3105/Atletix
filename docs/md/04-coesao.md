# 4. Análise de coesão — Atletix

## 4.1 O que foi analisado

Para Richards e Ford, **coesão** mede quanto as partes de um módulo pertencem juntas. A escala vai do melhor caso ao pior. [Richards e Ford, cap. 3, Modularidade](https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/ch03.html).

| Tipo de coesão | As partes estão juntas porque… |
|---|---|
| **Funcional** | colaboram para um único propósito |
| Sequencial | a saída de uma é a entrada da outra |
| Comunicacional | trabalham sobre os mesmos dados |
| Procedural | precisam rodar em certa ordem |
| Temporal | acontecem no mesmo momento |
| Lógica | pertencem à mesma categoria de operação |
| Coincidental | foram reunidas por conveniência |

A classificação abaixo é do **módulo inteiro**: o que importa é o propósito que une todos os seus casos de uso.

## 4.2 Coesão de cada módulo

Os sete módulos têm coesão **funcional**. Para cada um, a análise mostra o propósito, o que há dentro e o agrupamento ruim que foi evitado.

### Identidade

- **Propósito:** provar quem é o usuário e manter a sessão dele.
- **O que há dentro:** a credencial conta as tentativas de senha, o login confere a credencial e o serviço de sessões abre e revoga sessões.
- **O que foi evitado:** repetir a conferência de senha e o bloqueio dentro das rotas de check-in e de matrícula.
- **Onde ver:** `identidade/dominio/credencial.ts`, `identidade/aplicacao/entrar.ts` e `identidade/aplicacao/servico-de-sessoes.ts`.

### Autorização

- **Propósito:** controlar o que cada pessoa pode fazer.
- **O que há dentro:** a atribuição de papéis, a política que liga papéis a permissões e a consulta que usa as duas para decidir o acesso.
- **O que foi evitado:** cada rota manter a sua própria lista de papéis aceitos.
- **Onde ver:** `autorizacao/aplicacao/alterar-papel.ts`, `autorizacao/dominio/politica-de-acesso.ts` e `autorizacao/aplicacao/consultar-acesso.ts`.

### Usuários

- **Propósito:** manter o cadastro da pessoa e o status da conta.
- **O que há dentro:** a entidade que normaliza os dados, os casos de uso de cadastro e de mudança de status, e o diretório de consulta.
- **O que foi evitado:** uma única classe guardando dados pessoais, hash de senha e papel.
- **Onde ver:** `usuarios/dominio/usuario.ts`, `usuarios/aplicacao/cadastrar-usuario.ts`, `usuarios/aplicacao/alterar-status-do-usuario.ts` e `usuarios/aplicacao/diretorio-de-usuarios-local.ts`.

### Matrículas

- **Propósito:** saber se o vínculo do aluno com a academia está valendo.
- **O que há dentro:** a entidade que calcula a validade pelo plano, o registro que encadeia renovações e a consulta da situação.
- **O que foi evitado:** recalcular as datas dos planos também no Check-in, duplicando a regra.
- **Onde ver:** `matriculas/dominio/matricula.ts`, `matriculas/aplicacao/registrar-matricula.ts` e `matriculas/aplicacao/consultar-situacao.ts`.

### Check-in

- **Propósito:** decidir e registrar a entrada do aluno.
- **O que há dentro:** o registro, que confere as condições e a repetição no dia, e a consulta do histórico. Os dois usam a mesma definição de "dia".
- **O que foi evitado:** colocar a regra de um check-in por dia em Matrículas, só por ambas serem "coisas da academia" (coesão lógica).
- **Onde ver:** `checkin/aplicacao/registrar-checkin.ts`, `checkin/aplicacao/consultar-checkins.ts` e `checkin/dominio/checkin.ts`.

### Notificações

- **Propósito:** comunicar um fato ao destinatário.
- **O que há dentro:** o ouvinte que monta o texto, o serviço que guarda a mensagem na caixa de saída e a porta de envio de e-mail.
- **O que foi evitado:** montar o texto e chamar o envio dentro dos casos de uso de senha.
- **Onde ver:** `notificacoes/api/ouvinte-de-identidade.ts`, `notificacoes/aplicacao/servico-de-notificacoes.ts` e `notificacoes/infraestrutura/adaptadores.ts`.

### Auditoria

- **Propósito:** permitir reconstituir o que aconteceu no sistema.
- **O que há dentro:** o ouvinte que escolhe o que guardar de cada evento, o serviço que grava e a consulta da trilha. Os eventos vêm de cinco módulos, mas servem ao mesmo fim.
- **O que foi evitado:** cada módulo gravar as suas próprias linhas na tabela de auditoria.
- **Onde ver:** `auditoria/api/ouvinte-de-eventos.ts`, `auditoria/aplicacao/servico-de-auditoria.ts` e `auditoria/infraestrutura/repositorio-de-registros-typeorm.ts`.
