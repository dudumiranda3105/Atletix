import { PermissoesDeAuditoria } from '../../auditoria/contratos/permissoes';
import { PermissoesDeCheckin } from '../../checkin/contratos/permissoes';
import { PermissoesDeMatriculas } from '../../matriculas/contratos/permissoes';
import { PermissoesDeNotificacoes } from '../../notificacoes/contratos/permissoes';
import { PermissoesDeUsuarios } from '../../usuarios/contratos/permissoes';
import { Papel } from '../contratos/papel';
import { PermissoesDeAutorizacao } from '../contratos/permissoes';

/**
 * Política de acesso: o que cada papel pode fazer.
 *
 * Cada módulo declara o NOME das suas permissões no próprio contrato; este arquivo é o único
 * lugar que decide QUAIS papéis as possuem. Mudar a política não exige tocar em nenhum outro módulo.
 */
const PERMISSOES_POR_PAPEL: Record<Papel, ReadonlySet<string>> = {
  [Papel.ADMIN]: new Set([
    PermissoesDeUsuarios.LISTAR,
    PermissoesDeUsuarios.ALTERAR_STATUS,
    PermissoesDeAutorizacao.LISTAR_ATRIBUICOES,
    PermissoesDeAutorizacao.ALTERAR_PAPEL,
    PermissoesDeMatriculas.REGISTRAR,
    PermissoesDeMatriculas.CONSULTAR,
    PermissoesDeCheckin.LISTAR_DO_DIA,
    PermissoesDeAuditoria.CONSULTAR,
    PermissoesDeNotificacoes.VER_CAIXA_DE_SAIDA,
  ]),
  [Papel.RECEPCAO]: new Set([
    PermissoesDeUsuarios.LISTAR,
    PermissoesDeMatriculas.REGISTRAR,
    PermissoesDeMatriculas.CONSULTAR,
    PermissoesDeCheckin.LISTAR_DO_DIA,
  ]),
  [Papel.INSTRUTOR]: new Set([PermissoesDeUsuarios.LISTAR, PermissoesDeMatriculas.CONSULTAR]),
  [Papel.ALUNO]: new Set([
    PermissoesDeMatriculas.CONSULTAR_PROPRIA,
    PermissoesDeCheckin.REGISTRAR_PROPRIO,
    PermissoesDeCheckin.LISTAR_PROPRIOS,
  ]),
};

/** Papel de quem ainda não recebeu nenhum: o de menor privilégio. */
export const PAPEL_PADRAO = Papel.ALUNO;

export function papelPermite(papel: Papel, permissao: string): boolean {
  return PERMISSOES_POR_PAPEL[papel].has(permissao);
}

export function permissoesDoPapel(papel: Papel): string[] {
  return [...PERMISSOES_POR_PAPEL[papel]].sort();
}
