# ADR-001 — Monólito modular particionado por domínio

- **Status:** Aceita
- **Data:** 12/11/2026
- **Relacionada a:** [02 — Estilo arquitetural](../02-estilo-arquitetural.md)

## Contexto

O Atletix é um sistema de gestão de academias com foco no **controle de autenticação e autorização**. As características priorizadas são **segurança**, **manutenibilidade/modularidade** e **evolutividade**. Escalabilidade e disponibilidade têm demanda moderada: uma unidade, com centenas de alunos.

As restrições são uma equipe de 3 pessoas, prazo de 2 semanas e apresentação local sem internet. A autenticação é consumida por quase todos os fluxos (check-in, cadastro, administração), então espalhá-la pelo sistema geraria alto acoplamento e risco de falhas de segurança.

## Decisão

Adotar um **monólito modular** com **particionamento de nível superior por domínio**:

- módulos `identidade`, `autorizacao`, `usuarios`, `matriculas`, `checkin`, `notificacoes` e `auditoria`;
- **camadas dentro de cada módulo** (`api → aplicacao → dominio ← infraestrutura`);
- módulos se comunicam **apenas** pelo seu contrato público (`contratos/`), de forma **síncrona** quando quem chama precisa da resposta;
- efeitos colaterais entre módulos são feitos por **eventos internos assíncronos**;
- **cada módulo é dono das suas tabelas**;
- uma única unidade de implantação (um quantum arquitetural).

## Consequências

**Positivas**

- Alta coesão: cada mudança de negócio fica concentrada em um módulo.
- Baixo acoplamento: os módulos dependem de contratos e eventos, não de implementações.
- Simples de executar, testar e apresentar; chamadas em memória, sem falhas de rede.
- Consistência simples (ex.: desativar a conta e revogar as sessões).
- Caminho claro para extrair a Identidade como serviço no futuro.

**Negativas / riscos**

- Sem implantação, escalabilidade ou isolamento de falhas independentes por módulo.
- Risco de erosão das fronteiras (um `import` indevido entre módulos).
- Eventos internos são perdidos se o processo cair. Isso é aceitável para notificações e auditoria neste contexto e pode ser resolvido no futuro com um *outbox* ou broker.

## Conformidade (como verificar)

- Regras do `dependency-cruiser` executadas junto com os testes:
    - importação entre módulos somente via `*/contratos/*`;
    - `dominio/` sem dependência de `@nestjs/*`, `typeorm` ou `api/`;
    - nenhum ciclo de importação entre arquivos, e nenhum ciclo nas chamadas síncronas entre módulos.
- Revisão nos pull requests: um novo módulo precisa declarar seu contrato e seus eventos.

## Alternativas consideradas

| Alternativa | Motivo da rejeição |
|---|---|
| Camadas com particionamento técnico | Baixa modularidade; mudanças de domínio atravessam todas as camadas |
| Baseado em serviços | Custo de vários implantáveis sem ganho para as prioridades atuais; fica como evolução |
| Microsserviços | Complexidade distribuída na autenticação (latência, consistência de revogação, infraestrutura) incompatível com equipe, prazo e prioridades |
| Orientado a eventos como estilo principal | Login é síncrono; fluxo totalmente assíncrono dificultaria testes e rastreamento. Eventos são usados apenas para efeitos colaterais |
