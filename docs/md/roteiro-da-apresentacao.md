# Roteiro da apresentação — Atletix

Slides: [Apresentacao_Atletix.pdf](../pdf/Apresentacao_Atletix.pdf) (14 slides, formato 16:9).

O roteiro foi montado para **15 minutos de fala e demonstração**, mais as perguntas. Se o professor der menos tempo, corte primeiro os slides 3 e 13 e reduza a demonstração aos passos 1, 4, 5 e 7.

A divisão de falas abaixo é uma proposta. Como a apresentação é por sorteio, os três precisam conseguir apresentar qualquer bloco.

## 1. Antes de entrar na sala

Faça isto no notebook que será usado, com antecedência. A aplicação roda sem internet depois de instalada.

1. Na pasta `backend`: `npm install`, depois `npm run semente` para recriar os dados de demonstração.
2. Ainda em `backend`: `npm run start`. Deixe o terminal aberto.
3. Na pasta `frontend`: `npm install`, depois `npm run dev`. Deixe o terminal aberto.
4. Abra `http://localhost:5173` e confira o login com a conta do administrador.
5. Abra uma **janela anônima** no mesmo endereço. Ela será usada para a segunda conta na demonstração.
6. Deixe o PDF dos slides aberto em tela cheia e o PDF do documento em outra aba.
7. Em um terceiro terminal, na pasta `backend`, deixe digitado `npm run verificar`, sem executar.

As contas de demonstração estão na tabela do `README.md` do repositório. A senha é a mesma para todas e está na variável `SEMENTE_SENHA` do arquivo `backend/.env.example`.

**Atenção:** rode `npm run semente` de novo logo antes de apresentar. O check-in vale uma vez por dia e a demonstração desativa uma conta; a semente devolve tudo ao estado inicial.

## 2. Fala por slide

| Slide | Tempo | Quem | O que dizer |
|:---:|:---:|---|---|
| 1. Capa | 0:20 | Eduarda | Nome do sistema, tema A4 (controle de autenticação) e nomes do trio. |
| 2. O problema | 1:00 | Eduarda | Toda tela precisa saber quem é a pessoa e o que ela pode fazer. Se cada tela resolve isso sozinha, uma mudança se espalha, uma rota esquece de conferir o perfil e evoluir fica caro. |
| 3. O que priorizamos | 1:00 | Eduarda | Segurança, manutenibilidade e evolutividade, nessa ordem. Cada uma tem um cenário que dá para medir. Escalabilidade ficou depois porque a demanda é de uma unidade. |
| 4. A decisão | 1:15 | Eduarda | Camadas técnicas e microsserviços foram rejeitados, e por quê. O monólito modular dá fronteiras claras em um único processo. Diga o que ganhamos e o que abrimos mão. |
| 5. Os sete módulos | 1:00 | Eduarda | Aponte os três grupos no desenho. Seta contínua é chamada pelo contrato; seta tracejada é evento. Usuários está embaixo porque todos dependem dele. |
| 6. Coesão | 1:15 | Rebeca | Cada módulo tem um propósito que cabe em uma frase. O exemplo central: a classe `Usuario` única foi dividida em três módulos, porque cadastro, senha e papel mudam por motivos diferentes. |
| 7. Acoplamento | 1:15 | Rebeca | Leia duas linhas da tabela: Usuários (Ca 5, Ce 0) e Auditoria (Ca 1, Ce 5). Explique que o Ce alto da Auditoria é fraco, pois ela só conhece classes de eventos. |
| 8. Duas formas de conversar | 1:15 | Rebeca | Contrato quando quem chama precisa da resposta; evento quando outros reagem a algo que já aconteceu. Siga o desenho: Usuários desativa a conta e não chama ninguém. |
| 9. Conascência | 1:30 | Rebeca | Escolha três linhas, não as sete: Nome (reduzida com constante), Execução (ordem confinada em um método) e Valor (eliminada ao tirar o papel do token). Feche com a regra do livro. |
| 10. Autenticação por dentro | 1:15 | Eduardo | Dois tokens com papéis diferentes. A sessão é conferida em toda requisição; diga o trade-off em voz alta, pois ele costuma virar pergunta. |
| 11. Como sabemos que funciona | 1:00 | Eduardo | As regras de arquitetura falham o build. Conte a história das quatro falhas achadas atacando a própria API. Se houver tempo, rode `npm run verificar`. |
| 12. Demonstração | 3:00 | Eduardo | Siga a seção 3 deste roteiro. |
| 13. Limites e próximos passos | 0:45 | Eduardo | Escolha dois limites e mostre que cada evolução troca uma única peça. |
| 14. Perguntas | — | Todos | — |

## 3. Demonstração passo a passo

Use a janela normal para a conta da aluna e a janela anônima para o administrador. Assim as duas sessões ficam abertas ao mesmo tempo.

| Passo | O que fazer | O que falar |
|:---:|---|---|
| 1 | Janela normal: entrar como **aluna** e clicar em fazer check-in. | O Check-in perguntou a Usuários se a conta está ativa e a Matrículas se a matrícula está em dia. Dois contratos, nenhuma tabela compartilhada. |
| 2 | Tentar o check-in de novo. | Regra de negócio do próprio módulo: uma entrada por dia. |
| 3 | Sair e entrar como **aluno sem matrícula**; tentar o check-in. | A recusa vem de Matrículas, pelo contrato. O Check-in não sabe calcular validade. |
| 4 | Entrar de novo como **aluna** e digitar `/usuarios` na barra de endereço. | Esconder o menu não é segurança. A interface avisa e a API responde 403. |
| 5 | Janela anônima: entrar como **administrador**, abrir Usuários e trocar o perfil de alguém. | O seletor fala com a Autorização. O papel não está no token, então a mudança vale na requisição seguinte. |
| 6 | Ainda como administrador, **desativar a conta da aluna**. Voltar à janela normal e clicar em qualquer item do menu. | Usuários publicou um evento; a Identidade reagiu e encerrou as sessões. A aluna caiu para a tela de login. |
| 7 | Como administrador, abrir **Auditoria**. | Tudo o que fizemos está aqui. Nenhum módulo chamou a Auditoria: ela só assina eventos. |

Se sobrar tempo: na tela de login, usar "Esqueci minha senha" e mostrar o e-mail na **Caixa de saída** do administrador.

**Plano B.** Se a aplicação não subir, mostre a seção 8 do documento, que tem as mesmas telas capturadas, e rode apenas `npm run verificar`.

## 4. Perguntas prováveis

**Por que não microsserviços?**
A autenticação é consultada em toda requisição. Com microsserviços, haveria uma chamada de rede no meio de cada uma, além de infraestrutura que não cabe em duas semanas com três pessoas. A demanda de uma academia não justifica escalar módulos separadamente. Está no ADR-001.

**Se é um monólito, o que impede um módulo de acessar o interior do outro?**
Oito regras do dependency-cruiser, executadas por `npm run arquitetura`. Se um arquivo importar o interior de outro módulo, o build falha. Além disso, cada módulo do NestJS exporta apenas os contratos.

**Por que separar Identidade, Autorização e Usuários? Não é exagero?**
São três motivos diferentes para mudar: como a pessoa prova quem é, o que ela pode fazer e quais são os seus dados. Juntos, trocar o algoritmo de senha mexeria na mesma classe que o cadastro. Está no ADR-004.

**O token JWT não deveria dispensar consulta ao banco?**
Sim, e abrimos mão disso de propósito. Sem a consulta, um token continuaria valendo por até 15 minutos depois do logout ou da desativação da conta. Como segurança é a primeira prioridade, a sessão é conferida em toda requisição. Está no ADR-005.

**O que acontece se o sistema cair depois de gravar e antes de o evento ser entregue?**
A reação se perde: o registro de auditoria ou o e-mail daquele evento não acontece. Aceitamos isso neste contexto e deixamos registrado como limite. A correção é uma fila de mensagens, e ela troca apenas o publicador de eventos. Está no ADR-006.

**Existe dependência cíclica?**
Entre arquivos e entre chamadas síncronas, não. Somando todos os tipos de vínculo, há um ciclo entre Autorização e Auditoria: uma lê o nome de uma permissão, a outra assina um evento. Nenhuma chama a outra. Está na seção 5.3.

**Qual é a conascência mais forte que sobrou?**
A temporal: a validade do link de recuperação, entre Identidade e Notificações. Na escala do livro ela fica acima da de execução, e é a única dinâmica que atravessa módulos. Foi mantida, mas a duração é definida só na Identidade e o horário de vencimento viaja dentro do evento; Notificações mostra o horário que recebeu, sem repetir a regra.

**Como a conascência de valor foi eliminada?**
No início o papel do usuário ia dentro do token. Token e banco precisavam concordar sobre o mesmo valor, e trocar o perfil só valia quando o token vencesse. Tiramos o papel do token: agora ele é consultado na Autorização a cada requisição.

**Por que SQLite?**
Para a aplicação rodar em qualquer notebook, sem instalar servidor de banco. O acesso passa por repositórios atrás de portas, então trocar por PostgreSQL altera a configuração e os adaptadores, não as regras.

**Qual é a diferença entre Ca e Ce?**
Ca (aferente) conta quantos módulos dependem deste. Ce (eferente) conta de quantos este depende. Ca alto pede estabilidade: por isso o contrato de Usuários deve mudar pouco.

**O que vocês fariam diferente com mais tempo?**
Limite de tentativas por endereço IP, token de renovação em cookie protegido em vez do armazenamento do navegador, e fila de mensagens para os eventos. Os três estão registrados como limites assumidos nos ADR-005 e ADR-006.
