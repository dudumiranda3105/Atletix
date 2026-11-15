import { randomUUID } from 'node:crypto';

export enum Plano {
  MENSAL = 'MENSAL',
  TRIMESTRAL = 'TRIMESTRAL',
  ANUAL = 'ANUAL',
}

const DIAS_POR_PLANO: Record<Plano, number> = {
  [Plano.MENSAL]: 30,
  [Plano.TRIMESTRAL]: 90,
  [Plano.ANUAL]: 365,
};

/** Vínculo de um aluno com um plano durante um período. */
export class Matricula {
  constructor(
    readonly id: string,
    readonly alunoId: string,
    readonly plano: Plano,
    readonly inicioEm: Date,
    readonly validaAte: Date,
    readonly criadaEm: Date,
  ) {}

  /** A validade é calculada a partir do plano; ninguém informa a data final manualmente. */
  static nova(alunoId: string, plano: Plano, inicioEm: Date, agora: Date): Matricula {
    const validaAte = new Date(inicioEm.getTime() + DIAS_POR_PLANO[plano] * 24 * 60 * 60_000);
    return new Matricula(randomUUID(), alunoId, plano, inicioEm, validaAte, agora);
  }

  estaAtiva(agora: Date): boolean {
    return this.inicioEm <= agora && agora < this.validaAte;
  }
}

export const REPOSITORIO_DE_MATRICULAS = Symbol('REPOSITORIO_DE_MATRICULAS');

export interface RepositorioDeMatriculas {
  salvar(matricula: Matricula): Promise<void>;
  /** Matrículas do aluno, da validade mais distante para a mais antiga. */
  listarDoAluno(alunoId: string): Promise<Matricula[]>;
}
