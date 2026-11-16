# ADR-006 — Eventos internos para efeitos colaterais

- **Status:** Aceita
- **Data:** 15/11/2026
- **Relacionada a:** [ADR-001](ADR-001-estilo-arquitetural.md)

## Contexto

Várias ações do sistema têm consequências que não fazem parte da ação em si. Quando uma conta é desativada, as sessões dela precisam ser encerradas e o fato precisa ir para a auditoria. Quando alguém pede a recuperação de senha, um e-mail precisa ser enviado.

Se cada módulo chamasse diretamente os interessados, Usuários teria de conhecer a Identidade e a Auditoria, e a Identidade teria de conhecer Notificações. Cada nova reação exigiria alterar o módulo que originou o fato, e uma falha no envio de e-mail poderia derrubar o login.

## Decisão

Os módulos se comunicam de duas formas, com um critério para escolher:

| Situação | Forma | Exemplo |
|---|---|---|
| Quem chama precisa da resposta para continuar | Chamada síncrona pelo contrato | O Check-in pergunta se a matrícula está ativa |
| Outros módulos precisam reagir a algo que já aconteceu | Evento | `UsuarioDesativado`, `RecuperacaoDeSenhaSolicitada` |

Sobre os eventos:

- O módulo que produz um evento declara a classe dele em `contratos/eventos.ts`.
- A publicação passa pela porta `PublicadorDeEventos`. A implementação atual entrega em memória, no mesmo processo.
- **Quem publica não espera por quem assina**, e a falha de um assinante não afeta os outros nem o produtor.
- Eventos que geram mensagens levam junto os dados necessários, como nome e e-mail. Assim Notificações não precisa consultar outro módulo.
- Notificações e Auditoria apenas assinam. Nenhum módulo as chama.

## Consequências

**Positivas**

- Uma nova reação é um novo assinante. O módulo que produz o evento não muda.
- Uma falha ao gravar a auditoria ou ao enviar um e-mail não impede o login nem a desativação.
- A Auditoria registra o sistema inteiro sem que nenhum módulo dependa dela.

**Negativas / riscos**

- **Sem durabilidade.** Se o processo cair entre a gravação e a reação, a reação se perde. Aceitamos isso para notificações e auditoria neste contexto.
- **Consistência eventual.** As sessões de uma conta desativada são encerradas instantes depois, não na mesma transação. O risco é coberto pela verificação do status da conta em toda requisição (ADR-005).
- **Fluxo menos visível.** Lendo só o produtor, não se sabe quem reage. É preciso procurar os assinantes do evento.
- O nome e o formato do evento passam a ser um acordo entre módulos (seção 6, exemplo C1).

## Conformidade (como verificar)

- `compartilhado/eventos/publicador-em-memoria.spec.ts` verifica que a falha de um assinante não afeta o produtor nem os demais.
- O teste de ponta a ponta de auditoria confirma que os eventos chegam e que dados sensíveis, como o token de recuperação, não são gravados.

## Alternativas consideradas

| Alternativa | Motivo da rejeição |
|---|---|
| Chamadas diretas entre módulos para tudo | Acoplamento alto e falhas em cascata; o produtor teria de conhecer todos os interessados |
| Fila de mensagens externa (RabbitMQ, por exemplo) desde já | Resolve a durabilidade, mas exige infraestrutura incompatível com o prazo e com a apresentação sem internet. Fica como evolução: basta trocar a implementação do publicador |
| Eventos para tudo, inclusive consultas | O login e o check-in precisam de resposta imediata; um fluxo todo assíncrono dificultaria testes e rastreamento |
