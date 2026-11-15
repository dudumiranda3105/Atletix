export const MAXIMO_DE_TENTATIVAS = 5;
export const MINUTOS_DE_BLOQUEIO = 15;

/** Senha (como hash) de um usuário e o controle de tentativas de login. */
export class Credencial {
  constructor(
    readonly usuarioId: string,
    private _hashDaSenha: string,
    private _tentativasFalhas: number,
    private _bloqueadaAte: Date | null,
    private _senhaAlteradaEm: Date,
  ) {}

  static nova(usuarioId: string, hashDaSenha: string, agora: Date): Credencial {
    return new Credencial(usuarioId, hashDaSenha, 0, null, agora);
  }

  get hashDaSenha(): string {
    return this._hashDaSenha;
  }
  get tentativasFalhas(): number {
    return this._tentativasFalhas;
  }
  get bloqueadaAte(): Date | null {
    return this._bloqueadaAte;
  }
  get senhaAlteradaEm(): Date {
    return this._senhaAlteradaEm;
  }

  estaBloqueada(agora: Date): boolean {
    return this._bloqueadaAte !== null && this._bloqueadaAte > agora;
  }

  /** Conta uma tentativa com senha errada. Devolve true se esta tentativa bloqueou a conta. */
  registrarFalha(agora: Date): boolean {
    this._tentativasFalhas += 1;
    if (this._tentativasFalhas < MAXIMO_DE_TENTATIVAS) return false;
    this._bloqueadaAte = new Date(agora.getTime() + MINUTOS_DE_BLOQUEIO * 60_000);
    this._tentativasFalhas = 0;
    return true;
  }

  registrarSucesso(): void {
    this._tentativasFalhas = 0;
    this._bloqueadaAte = null;
  }

  /** Trocar a senha também libera a conta: quem provou ser o dono não deve continuar bloqueado. */
  definirSenha(hashDaSenha: string, agora: Date): void {
    this._hashDaSenha = hashDaSenha;
    this._senhaAlteradaEm = agora;
    this.registrarSucesso();
  }
}
