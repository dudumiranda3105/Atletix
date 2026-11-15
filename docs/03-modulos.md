# 3. Módulos e responsabilidades — Atletix

## 3.1 O que cada módulo faz

O backend reúne **sete módulos de domínio** na mesma aplicação NestJS. A composição está em `backend/src/app.module.ts`, que registra os módulos, o guarda global, o barramento de eventos e a conexão com o banco.

| Módulo | Responsabilidade em uma frase | Por que foi separado | Onde ver |
|---|---|---|---|
| `identidade` | Autentica usuários e cuida do ciclo de vida das credenciais, dos tokens e das sessões. | Regras de senha, bloqueio e renovação mudam por motivos de segurança da autenticação. | `backend/src/modulos/identidade/identidade.module.ts` |
| `autorizacao` | Atribui papéis e decide quais permissões cada papel concede. | Uma mudança na política de acesso tem efeito próprio, inclusive para quem já tem um token válido. | `backend/src/modulos/autorizacao/autorizacao.module.ts` |
| `usuarios` | Mantém o cadastro da pessoa e o estado ativo ou inativo da conta. | Nome, e-mail e situação cadastral são consultados por vários fluxos, com uma fonte comum para esses dados. | `backend/src/modulos/usuarios/usuarios.module.ts` |
| `matriculas` | Registra os planos contratados e calcula a vigência da matrícula do aluno. | A duração e a renovação dos planos pertencem ao vínculo com a academia. | `backend/src/modulos/matriculas/matriculas.module.ts` |
| `checkin` | Aplica as condições de entrada do aluno e registra e consulta seus check-ins. | A regra de uma entrada por dia pode mudar independentemente do cadastro e do cálculo de vigência. | `backend/src/modulos/checkin/checkin.module.ts` |
| `notificacoes` | Converte eventos de identidade em e-mails, guarda as mensagens na caixa de saída e passa o envio ao adaptador simulado. | Formato da mensagem e mecanismo de envio têm um ciclo de mudança próprio. | `backend/src/modulos/notificacoes/notificacoes.module.ts` |
| `auditoria` | Converte eventos do sistema em registros consultáveis da trilha de auditoria. | Os campos da trilha e a forma de consulta podem evoluir no módulo que os mantém. | `backend/src/modulos/auditoria/auditoria.module.ts` |

## 3.2 Como os módulos são organizados por dentro

Os sete módulos têm as pastas `api/`, `aplicacao/`, `dominio/`, `infraestrutura/` e `contratos/`. Os arquivos de montagem da tabela acima ligam as entradas aos casos de uso e associam as portas aos adaptadores.

- **API.** Recebe as chamadas HTTP e, onde há assinatura de eventos, hospeda os ouvintes. Exemplos em `backend/src/modulos/identidade/api/auth.controller.ts` e `backend/src/modulos/identidade/api/ouvinte-de-usuarios.ts`.
- **Aplicação.** Coordena os passos de cada caso de uso. O registro de entrada consulta conta e matrícula e depois grava o check-in em `backend/src/modulos/checkin/aplicacao/registrar-checkin.ts`.
- **Domínio.** Reúne entidades, regras e portas usadas dentro do módulo. A regra de vigência está em `backend/src/modulos/matriculas/dominio/matricula.ts`.
- **Infraestrutura.** Implementa persistência ou integrações, como o repositório de matrículas em `backend/src/modulos/matriculas/infraestrutura/repositorio-de-matriculas-typeorm.ts` e o adaptador de e-mail em `backend/src/modulos/notificacoes/infraestrutura/adaptadores.ts`.
- **Contratos.** Expõem interfaces de consulta, classes de eventos ou nomes de permissões, conforme o módulo. A consulta de matrículas está em `backend/src/modulos/matriculas/contratos/consulta-de-matriculas.ts` e a permissão de auditoria em `backend/src/modulos/auditoria/contratos/permissoes.ts`.

O cadastro mostra a fronteira entre três responsabilidades que poderiam acabar juntas. Identidade valida a senha, pede o cadastro da pessoa pelo diretório de Usuários e grava a credencial. Autorização resolve o papel padrão de quem ainda não tem atribuição explícita. Assim, senha, dados cadastrais e papel têm donos distintos, mesmo quando participam do mesmo fluxo. Ver `backend/src/modulos/identidade/aplicacao/cadastrar-conta.ts`, `backend/src/modulos/usuarios/aplicacao/diretorio-de-usuarios-local.ts` e `backend/src/modulos/autorizacao/aplicacao/consultar-acesso.ts`.

O núcleo compartilhado fornece relógio, erros, publicação de eventos e portas de segurança. A montagem dessas peças fica em `backend/src/compartilhado/nucleo.module.ts` e `backend/src/app.module.ts`.
