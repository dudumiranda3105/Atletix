# 6. Análise de conascência — Atletix

## 6.1 Como ler os exemplos

Há **conascência** quando mudar uma parte do código obriga a mudar outra para o sistema continuar correto. [Richards e Ford, cap. 3, Modularidade](https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/ch03.html).

- **Estática:** dá para ver lendo o código. Exemplos: nome, tipo, convenção e posição.
- **Dinâmica:** só aparece com o sistema rodando. Exemplos: ordem de execução, tempo e valor.

Três critérios ajudam a decidir o que fazer com cada caso:

- **Força:** quanto trabalho dá mudar as partes juntas. As dinâmicas são mais fortes que as estáticas.
- **Localidade:** quão perto as partes estão. Dentro de um módulo é aceitável; entre módulos, pede cuidado.
- **Grau:** quantas partes compartilham o acordo.

A regra prática do livro é: quanto mais distantes as partes, mais fraca deve ser a conascência entre elas.

## 6.2 Os sete exemplos

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

- **O acordo:** quem publica e quem assina o evento `UsuarioDesativado` precisam usar o mesmo nome. Três módulos participam.
- **Tratamento:** o nome existe em um único lugar, a constante `UsuarioDesativado.NOME`. O produtor e os dois assinantes usam a constante, e ninguém copia o texto.
- **Impacto:** renomear o evento é alterar uma linha.
- **Onde ver:** `usuarios/contratos/eventos.ts`, `identidade/api/ouvinte-de-usuarios.ts` e `auditoria/api/ouvinte-de-eventos.ts`.

### C2 — Tipo (estática) · mantida

- **O acordo:** o Check-in espera de Matrículas uma resposta do tipo `SituacaoDaMatricula`, com o campo booleano `ativa`.
- **Tratamento:** mantida e declarada no contrato `ConsultaDeMatriculas`. Entre módulos, a conascência de tipo é uma das mais fracas, e o compilador a confere.
- **Impacto:** mudar o tipo exige ajustar os dois lados, e o TypeScript aponta onde. Mudar o cálculo da validade não afeta o Check-in.
- **Onde ver:** `matriculas/contratos/consulta-de-matriculas.ts`, `matriculas/aplicacao/consultar-situacao.ts` e `checkin/aplicacao/registrar-checkin.ts`.

### C3 — Convenção (estática) · mantida

- **O acordo:** a interface web envia o token no cabeçalho `Authorization`, com o prefixo `Bearer`. O guarda só aceita o token nesse formato.
- **Tratamento:** mantida, por ser o padrão do HTTP. Cada lado tem um único ponto que conhece o formato.
- **Impacto:** trocar o esquema exige mudar a interface e a API juntas, mas são apenas dois pontos.
- **Onde ver:** `frontend/src/compartilhado/api.ts` e `compartilhado/seguranca/guarda-de-seguranca.ts`.

### C4 — Posição (estática) · mantida no produtor

- **O acordo:** o construtor do evento `SenhaAlterada` recebe identificador, nome e e-mail, nessa ordem. Os três são texto, então inverter nome e e-mail compila e gera um e-mail errado.
- **Tratamento:** mantida, mas confinada à Identidade, que é quem cria o evento. Os assinantes leem os campos pelo nome, como `evento.email`.
- **Impacto:** o risco não atravessa a fronteira do módulo. Mudar a ordem dos parâmetros afeta só arquivos da Identidade.
- **Onde ver:** `identidade/contratos/eventos.ts`, `identidade/aplicacao/trocar-senha.ts` e `notificacoes/api/ouvinte-de-identidade.ts`.

### C5 — Execução (dinâmica) · reduzida

- **O acordo:** é preciso autenticar antes de autorizar. A permissão só pode ser conferida depois de se saber quem é o usuário.
- **Tratamento:** reduzida. A ordem está em um único método do guarda global, em vez de depender da ordem de registro de dois guardas separados.
- **Impacto:** toda rota protegida passa pelo mesmo ponto. Rever a ordem é rever um método.
- **Onde ver:** `compartilhado/seguranca/guarda-de-seguranca.ts` e `backend/src/app.module.ts`.

### C6 — Temporal (dinâmica) · mantida

- **O acordo:** o link de recuperação de senha vale 30 minutos. A redefinição precisa acontecer antes do vencimento, e o e-mail precisa informar o mesmo prazo.
- **Tratamento:** mantida. A duração é definida só na Identidade, e o horário de vencimento viaja dentro do evento. Notificações mostra o horário que recebeu, sem repetir a regra. Links pendentes são inutilizados quando um novo é pedido ou quando a senha muda.
- **Impacto:** mudar a duração é alterar uma constante. Um atraso no envio do e-mail consome parte do prazo.
- **Onde ver:** `identidade/dominio/token-de-recuperacao.ts`, `identidade/aplicacao/solicitar-recuperacao-de-senha.ts`, `identidade/aplicacao/redefinir-senha.ts` e `notificacoes/api/ouvinte-de-identidade.ts`.

### C7 — Valor (dinâmica) · eliminada

- **O acordo que existiria:** se o token de acesso carregasse o papel do usuário, o valor no token e o valor guardado pela Autorização teriam de coincidir durante toda a validade do token. Trocar o papel de alguém abriria um período em que os dois discordam.
- **Tratamento:** eliminada. O token leva somente os identificadores do usuário e da sessão, e o papel é lido da Autorização a cada verificação de permissão.
- **Impacto:** uma mudança de papel vale na requisição seguinte, sem invalidar tokens e sem coordenação com a Identidade. O teste "troca de papel vale na requisição seguinte, com o mesmo token" protege essa propriedade.
- **Onde ver:** `identidade/infraestrutura/adaptadores.ts`, `autorizacao/aplicacao/consultar-acesso.ts` e `backend/test/atletix.e2e-spec.ts`.
