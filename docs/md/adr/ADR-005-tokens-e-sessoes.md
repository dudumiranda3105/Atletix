# ADR-005 — Estratégia de tokens e sessões

- **Status:** Aceita
- **Data:** 15/11/2026
- **Relacionada a:** [ADR-002](ADR-002-stack-e-entrega.md) e [ADR-004](ADR-004-identidade-autorizacao-e-usuarios.md)

## Contexto

O controle de autenticação é o foco do sistema, e a segurança é a característica arquitetural de maior prioridade. Os cenários de qualidade da seção 1.5 exigem que uma conta desativada perca o acesso na requisição seguinte. A interface web e um futuro aplicativo móvel precisam usar o mesmo mecanismo.

Um token JWT puro, sem consulta ao servidor, não atende a esse cenário: ele continua valendo até expirar, mesmo depois de um logout ou de uma troca de senha. Uma sondagem feita na própria API confirmou essa falha em uma versão anterior.

## Decisão

Dois tokens, com papéis diferentes:

| | Token de acesso | Token de renovação |
|---|---|---|
| Formato | JWT assinado (HS256) | Valor aleatório de 32 bytes, sem significado |
| Validade | 15 minutos | 7 dias |
| Conteúdo | Identificador do usuário e da sessão | Nenhum |
| No banco | Não é guardado | Só o hash (SHA-256) |
| Uso | Enviado em toda requisição | Só para obter um novo par de tokens |

Regras que acompanham os tokens:

- **Sessão conferida a cada requisição.** O token de acesso só vale enquanto a sessão dele existir e não tiver sido revogada, e enquanto a conta estiver ativa.
- **Rotação.** Cada renovação invalida o token usado e emite um novo. Se um token já usado reaparecer, todas as sessões do usuário são encerradas.
- **Revogação em massa.** Trocar ou redefinir a senha e desativar a conta encerram todas as sessões.
- **Bloqueio.** Cinco senhas erradas seguidas bloqueiam a conta por 15 minutos.
- **Recuperação de senha.** Link de uso único, válido por 30 minutos. Só o link mais recente vale.
- **Segredo de assinatura.** Vem da configuração e é obrigatório em produção. Sem configuração, a API sorteia um segredo a cada inicialização. Não existe segredo fixo no código.

## Consequências

**Positivas**

- Logout, troca de senha, desativação e troca de papel valem na requisição seguinte.
- Quem ler o banco não consegue se passar por um usuário, pois só os hashes estão lá.
- O mesmo mecanismo serve para navegador e aplicativo, porque não depende de cookie.
- O formato do token está atrás de uma porta: trocá-lo altera um adaptador.

**Negativas / riscos**

- **Toda requisição consulta o banco**, o que abre mão da principal vantagem do JWT. No monólito é uma leitura local e barata. Se a Identidade virar um serviço separado, essa consulta vira uma chamada de rede e vai pedir um cache de curta duração.
- **O token de renovação fica no `localStorage` do navegador**, ao alcance de um script malicioso na página. Um cookie `HttpOnly` seria mais seguro na web, mas não serviria ao aplicativo móvel sem um segundo mecanismo.
- **O bloqueio por conta pode ser usado contra o próprio usuário**: alguém que erre a senha de propósito bloqueia a conta de outra pessoa por 15 minutos. Não há limite de tentativas por endereço IP.
- Duas renovações simultâneas com o mesmo token podem ser aceitas, por não haver trava no banco. A interface evita isso compartilhando uma única renovação em andamento.

## Conformidade (como verificar)

Testes de ponta a ponta em `backend/test/atletix.e2e-spec.ts`:

- token forjado, adulterado, sem assinatura, expirado, sem sessão ou com a sessão de outro usuário é recusado;
- o token de acesso deixa de valer no logout, na renovação e na troca de senha;
- a conta desativada perde o acesso na requisição seguinte;
- só o link de recuperação mais recente vale, uma única vez;
- cinco senhas erradas bloqueiam a conta.

## Alternativas consideradas

| Alternativa | Motivo da rejeição |
|---|---|
| JWT puro, sem consulta ao servidor | Não permite revogar; reprovado pelo cenário de conta desativada |
| Sessão tradicional em cookie, com estado no servidor | Atende à web, mas complica o uso por aplicativo móvel e por outros clientes |
| Papel e permissões dentro do token | Mudanças de papel só valeriam após a expiração (ADR-004) |
| Token de renovação guardado em texto puro | Um vazamento do banco entregaria todas as sessões ativas |
