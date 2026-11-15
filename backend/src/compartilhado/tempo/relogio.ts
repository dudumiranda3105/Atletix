/**
 * Fonte única de "agora". Regras que dependem de tempo (expiração de token, bloqueio de conta,
 * validade de matrícula) recebem o relógio por injeção, o que permite testá-las sem esperar.
 */
export const RELOGIO = Symbol('RELOGIO');

export interface Relogio {
  agora(): Date;
}

export class RelogioDoSistema implements Relogio {
  agora(): Date {
    return new Date();
  }
}
