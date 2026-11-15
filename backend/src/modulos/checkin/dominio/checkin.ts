import { randomUUID } from 'node:crypto';

/** Registro de uma entrada do aluno na academia. */
export class Checkin {
  constructor(
    readonly id: string,
    readonly alunoId: string,
    readonly registradoEm: Date,
  ) {}

  static novo(alunoId: string, agora: Date): Checkin {
    return new Checkin(randomUUID(), alunoId, agora);
  }
}

/** Início e fim do dia (horário do servidor) em que "agora" está. */
export function intervaloDoDia(agora: Date): { inicio: Date; fim: Date } {
  const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const fim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1);
  return { inicio, fim };
}

export const REPOSITORIO_DE_CHECKINS = Symbol('REPOSITORIO_DE_CHECKINS');

export interface RepositorioDeCheckins {
  salvar(checkin: Checkin): Promise<void>;
  existeNoIntervalo(alunoId: string, inicio: Date, fim: Date): Promise<boolean>;
  listarNoIntervalo(inicio: Date, fim: Date): Promise<Checkin[]>;
  listarDoAluno(alunoId: string, limite: number): Promise<Checkin[]>;
}
