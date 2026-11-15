import { randomUUID } from 'node:crypto';

/**
 * Sessão de um usuário, identificada pelo token de renovação.
 * O banco guarda apenas o hash do token: quem ler a tabela não consegue se passar pelo usuário.
 */
export class Sessao {
  constructor(
    readonly id: string,
    readonly usuarioId: string,
    readonly hashDoToken: string,
    readonly expiraEm: Date,
    private _revogadaEm: Date | null,
    readonly criadaEm: Date,
  ) {}

  static nova(usuarioId: string, hashDoToken: string, agora: Date, validadeEmDias: number): Sessao {
    const expiraEm = new Date(agora.getTime() + validadeEmDias * 24 * 60 * 60_000);
    return new Sessao(randomUUID(), usuarioId, hashDoToken, expiraEm, null, agora);
  }

  get revogadaEm(): Date | null {
    return this._revogadaEm;
  }

  foiRevogada(): boolean {
    return this._revogadaEm !== null;
  }

  expirou(agora: Date): boolean {
    return this.expiraEm <= agora;
  }

  revogar(agora: Date): void {
    if (!this._revogadaEm) this._revogadaEm = agora;
  }
}
