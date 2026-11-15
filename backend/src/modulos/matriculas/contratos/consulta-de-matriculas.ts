/**
 * Contrato público do módulo Matrículas.
 * Quem precisa saber se o aluno está em dia (ex.: Check-in) depende só desta interface.
 */
export interface SituacaoDaMatricula {
  readonly ativa: boolean;
  readonly plano: string | null;
  readonly validaAte: Date | null;
}

export const CONSULTA_DE_MATRICULAS = Symbol('CONSULTA_DE_MATRICULAS');

export interface ConsultaDeMatriculas {
  situacaoDoAluno(alunoId: string): Promise<SituacaoDaMatricula>;
}
