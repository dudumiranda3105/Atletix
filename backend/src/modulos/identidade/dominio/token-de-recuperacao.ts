import { randomUUID } from 'node:crypto';

export const MINUTOS_DE_VALIDADE_DA_RECUPERACAO = 30;

/** Token de uso único para redefinir a senha. Como na sessão, só o hash é guardado. */
export class TokenDeRecuperacao {
  constructor(
    readonly id: string,
    readonly usuarioId: string,
    readonly hashDoToken: string,
    readonly expiraEm: Date,
    private _usadoEm: Date | null,
  ) {}

  static novo(usuarioId: string, hashDoToken: string, agora: Date): TokenDeRecuperacao {
    const expiraEm = new Date(agora.getTime() + MINUTOS_DE_VALIDADE_DA_RECUPERACAO * 60_000);
    return new TokenDeRecuperacao(randomUUID(), usuarioId, hashDoToken, expiraEm, null);
  }

  get usadoEm(): Date | null {
    return this._usadoEm;
  }

  podeSerUsado(agora: Date): boolean {
    return this._usadoEm === null && this.expiraEm > agora;
  }

  marcarComoUsado(agora: Date): void {
    this._usadoEm = agora;
  }
}
