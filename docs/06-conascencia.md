# 6. Análise de conascência — Atletix

## 6.1 Como ler os exemplos

Há **conascência** quando mudar um elemento exige uma mudança correspondente em outro para preservar o comportamento. Ela é **estática** quando o acordo pode ser identificado no código, como um nome, tipo, convenção ou posição. É **dinâmica** quando a correção depende da execução, como uma ordem de chamadas ou um prazo. A **força** indica quanto trabalho exige uma mudança coordenada, a **localidade** indica quão próximas estão as partes envolvidas e o **grau** indica quantas partes compartilham o acordo. A análise usa esses três critérios para explicar por que certas dependências foram mantidas, outras reduzidas e uma eliminada. [Richards e Ford, cap. 3, Modularidade](https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/ch03.html).

## 6.2 Acordos que aparecem no código

A tabela resume os sete exemplos. O detalhe de cada um vem em seguida.

| Ex. | Tipo | Entre quais partes | Tratamento | Efeito na manutenção |
|---|---|---|---|---|
| C1 | Nome (estática) | Evento `UsuarioDesativado`: Usuários, Identidade e Auditoria | **Reduzida** | Renomear o evento altera um único literal |
| C2 | Tipo (estática) | Contrato `ConsultaDeMatriculas`: Matrículas e Check-in | **Mantida** | O compilador acusa qualquer divergência |
| C3 | Convenção (estática) | Cabeçalho `Authorization: Bearer`: interface web e guarda | **Mantida** | Mudar o esquema exige alteração coordenada dos dois lados |
| C4 | Posição (estática) | Construtor de `SenhaAlterada`: dentro da Identidade | **Mantida** no produtor | O risco fica em um módulo; os assinantes usam campos nomeados |
| C5 | Execução (dinâmica) | Autenticar antes de autorizar: guarda global | **Reduzida** | A ordem obrigatória está em um único método |
| C6 | Temporal (dinâmica) | Validade do link de recuperação: Identidade e Notificações | **Mantida** | A duração muda em um lugar só |
| C7 | Valor (dinâmica) | Papel do usuário: token de acesso e Autorização | **Eliminada** | Trocar o papel vale na hora, sem invalidar tokens |

### C1 — Nome (estática) · reduzida

O publicador usa `evento.nome` como chave de despacho. No evento `UsuarioDesativado`, esse campo vem de `UsuarioDesativado.NOME`, que também é usado nos decoradores dos ouvintes de Identidade e Auditoria. O nome continua sendo o acordo de entrega entre três módulos, mas o literal tem uma fonte única. Renomeá-lo no monólito exige editar sua declaração, desde que os ouvintes continuem referenciando a constante.

**Evidência** em `backend/src/modulos/usuarios/contratos/eventos.ts`, `backend/src/compartilhado/eventos/publicador-em-memoria.ts`, `backend/src/modulos/identidade/api/ouvinte-de-usuarios.ts` e `backend/src/modulos/auditoria/api/ouvinte-de-eventos.ts`.

### C2 — Tipo (estática) · mantida

`ConsultarSituacao` implementa `ConsultaDeMatriculas`, e o Check-in espera uma `SituacaoDaMatricula` com o campo booleano `ativa`. O contrato mantém explícito o tipo compartilhado por dois módulos. Mudar o booleano para um status textual exige ajustar o contrato e os pontos de uso. O TypeScript verifica a compatibilidade declarada. Mudanças no cálculo da validade cabem em Matrículas se a resposta conservar seu tipo e significado.

**Evidência** em `backend/src/modulos/matriculas/contratos/consulta-de-matriculas.ts`, `backend/src/modulos/matriculas/aplicacao/consultar-situacao.ts` e `backend/src/modulos/checkin/aplicacao/registrar-checkin.ts`.

### C3 — Convenção (estática) · mantida

O cliente monta o cabeçalho `Authorization` com o esquema `Bearer`, e o guarda interpreta o primeiro termo exatamente como `Bearer` para aceitar o segundo como token. O acordo é sobre o significado do valor enviado no cabeçalho. Ele atravessa a fronteira entre frontend e backend. Mudar o esquema de autenticação exige compatibilidade durante a transição ou mudanças coordenadas no cliente e no servidor.

**Evidência** em `frontend/src/compartilhado/api.ts` e `backend/src/compartilhado/seguranca/guarda-de-seguranca.ts`.

### C4 — Posição (estática) · mantida no produtor

`TrocarSenha` instancia `SenhaAlterada` com o identificador, o nome, o e-mail e a data, nessa ordem. Os três primeiros argumentos são `string`. Inverter nome e e-mail pode compilar e produzir uma notificação incorreta. A dependência de posição fica entre o produtor e o construtor em Identidade. Os ouvintes acessam campos nomeados como `evento.email` e `evento.nomeDoUsuario`, o que limita o alcance de mudanças na assinatura do construtor.

**Evidência** em `backend/src/modulos/identidade/aplicacao/trocar-senha.ts`, `backend/src/modulos/identidade/contratos/eventos.ts` e `backend/src/modulos/notificacoes/api/ouvinte-de-identidade.ts`.

### C5 — Execução (dinâmica) · reduzida

O guarda global autentica, guarda o usuário na requisição e então avalia a permissão, quando a rota a exige. A decisão precisa da identidade retornada pela primeira chamada. A ordem continua obrigatória, mas fica local a um método. Mudanças no encadeamento podem ser revistas nesse ponto, que aplica a mesma ordem às rotas protegidas.

**Evidência** em `backend/src/compartilhado/seguranca/guarda-de-seguranca.ts` e `backend/src/app.module.ts`.

### C6 — Temporal (dinâmica) · mantida

A recuperação cria um token com vencimento de 30 minutos e publica seu prazo para a notificação. Para um link ainda válido e sem uso, a redefinição precisa acontecer **antes do vencimento**. O código também invalida links pendentes quando emite um novo link ou altera a senha. O e-mail exibe o horário recebido, o que permite mudar a duração no domínio de Identidade sem duplicar a regra em Notificações. Atrasos no envio consomem parte do tempo disponível para usar o link.

**Evidência** em `backend/src/modulos/identidade/aplicacao/solicitar-recuperacao-de-senha.ts`, `backend/src/modulos/identidade/dominio/token-de-recuperacao.ts`, `backend/src/modulos/notificacoes/api/ouvinte-de-identidade.ts`, `backend/src/modulos/identidade/aplicacao/redefinir-senha.ts` e `backend/src/modulos/identidade/aplicacao/trocar-senha.ts`.

### C7 — Valor (dinâmica) · eliminada

Se o token de acesso carregasse o papel do usuário, o valor guardado no token e o valor guardado pela Autorização teriam de coincidir durante toda a validade do token. Trocar o papel de alguém abriria um período em que os dois discordam, e corrigir isso exigiria invalidar tokens já emitidos. O projeto elimina esse acordo: o token leva somente os identificadores do usuário e da sessão, e o papel é lido da Autorização a cada verificação de permissão. Uma mudança de papel passa a valer na requisição seguinte, sem nenhuma coordenação com a Identidade. O teste de ponta a ponta "troca de papel vale na requisição seguinte, com o mesmo token" protege essa propriedade.

**Evidência** em `backend/src/modulos/identidade/infraestrutura/adaptadores.ts`, `backend/src/modulos/autorizacao/aplicacao/consultar-acesso.ts` e `backend/test/atletix.e2e-spec.ts`.
