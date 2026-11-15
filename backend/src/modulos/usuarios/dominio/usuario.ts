import { randomUUID } from 'node:crypto';
import { RegraViolada } from '../../../compartilhado/dominio/erros';

const FORMATO_DE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Pessoa cadastrada na academia (aluno ou funcionário). Não guarda senha nem papel. */
export class Usuario {
  constructor(
    readonly id: string,
    readonly nome: string,
    readonly email: string,
    private _ativo: boolean,
    readonly criadoEm: Date,
  ) {}

  static novo(dados: { nome: string; email: string }, agora: Date): Usuario {
    const nome = dados.nome.trim();
    const email = Usuario.normalizarEmail(dados.email);
    if (nome.length < 3) throw new RegraViolada('NOME_INVALIDO', 'O nome deve ter pelo menos 3 caracteres.');
    if (!FORMATO_DE_EMAIL.test(email)) throw new RegraViolada('EMAIL_INVALIDO', 'Informe um e-mail válido.');
    return new Usuario(randomUUID(), nome, email, true, agora);
  }

  /** Convenção única de e-mail no sistema: sem espaços e em minúsculas. */
  static normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  get ativo(): boolean {
    return this._ativo;
  }

  /** Devolve true se o estado mudou. */
  definirAtivo(ativo: boolean): boolean {
    if (this._ativo === ativo) return false;
    this._ativo = ativo;
    return true;
  }
}
