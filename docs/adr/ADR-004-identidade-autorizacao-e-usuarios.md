# ADR-004 — Separar Identidade, Autorização e Usuários

- **Status:** Aceita
- **Data:** 15/11/2026
- **Relacionada a:** [ADR-001](ADR-001-estilo-arquitetural.md)

## Contexto

Em muitos sistemas, "usuário" é uma única classe que guarda nome, e-mail, hash da senha e papel. No Atletix, essas informações mudam por motivos diferentes:

- a forma de provar a identidade muda por segurança (novo algoritmo de hash, segundo fator, login social);
- a política de acesso muda por decisão da academia (um novo papel, uma permissão a mais para a recepção);
- o cadastro muda por necessidade do negócio (novos dados do aluno).

Juntar tudo faria uma mudança de um tipo arriscar as outras duas.

## Decisão

Três módulos, cada um dono de um dado:

| Módulo | É dono de | Pergunta que responde |
|---|---|---|
| **Usuários** | Nome, e-mail e status da conta | Quem é esta pessoa e a conta está ativa? |
| **Identidade** | Senha, sessões e tokens | Esta pessoa provou quem é? |
| **Autorização** | Papel de cada usuário e política de permissões | O que esta pessoa pode fazer? |

Usuários não depende de nenhum módulo. Identidade e Autorização dependem apenas do contrato `DiretorioDeUsuarios`. O papel não fica no cadastro nem dentro do token: é lido da Autorização a cada verificação.

## Consequências

**Positivas**

- Mudar a política de acesso altera um arquivo, `autorizacao/dominio/politica-de-acesso.ts`, e não toca no login.
- Acrescentar segundo fator ou login social fica restrito à Identidade.
- Usuários é a base estável do sistema: cinco módulos dependem dele e ele não depende de ninguém.

**Negativas / riscos**

- **Criar uma conta envolve dois módulos e não é uma transação única.** A Identidade pede o cadastro a Usuários e depois grava a credencial. Para reduzir o risco de sobrar um usuário sem senha, a senha é validada antes do cadastro. Ver `identidade/aplicacao/cadastrar-conta.ts`.
- **A tela de usuários faz duas chamadas** e junta os resultados pelo identificador: uma para Usuários e outra para a Autorização.
- **Cadastrar um funcionário são dois passos**: criar a conta e depois atribuir o papel.
- Quem ainda não recebeu um papel é tratado como `ALUNO`, o de menor privilégio. Essa regra existe em um só lugar.

## Conformidade (como verificar)

- A regra `modulo-so-conhece-o-contrato-do-outro` impede que um módulo leia as tabelas ou as classes internas de outro.
- O teste de ponta a ponta "troca de papel vale na requisição seguinte, com o mesmo token" confirma que o papel não está no token.

## Alternativas consideradas

| Alternativa | Motivo da rejeição |
|---|---|
| Um único módulo "Contas" | Coesão baixa: três motivos de mudança no mesmo lugar, e a parte mais sensível misturada com dados cadastrais |
| Guardar o papel no cadastro do usuário | Usuários passaria a conhecer a política de acesso |
| Levar o papel dentro do token de acesso | Uma troca de papel só valeria quando o token expirasse (seção 6, exemplo C7) |
