/**
 * Erros de domínio compartilhados por todos os módulos.
 *
 * O domínio fala em termos de negócio ("regra violada", "não encontrado") e não conhece HTTP.
 * A tradução para códigos de status acontece em um único ponto: compartilhado/http/filtro-de-erros.ts.
 */
export type TipoDeErro =
  | 'REGRA_VIOLADA'
  | 'NAO_ENCONTRADO'
  | 'CONFLITO'
  | 'NAO_AUTENTICADO'
  | 'ACESSO_NEGADO'
  | 'BLOQUEADO';

export class ErroDeDominio extends Error {
  constructor(
    readonly tipo: TipoDeErro,
    readonly codigo: string,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = new.target.name;
  }
}

export class RegraViolada extends ErroDeDominio {
  constructor(codigo: string, mensagem: string) {
    super('REGRA_VIOLADA', codigo, mensagem);
  }
}

export class NaoEncontrado extends ErroDeDominio {
  constructor(codigo: string, mensagem: string) {
    super('NAO_ENCONTRADO', codigo, mensagem);
  }
}

export class Conflito extends ErroDeDominio {
  constructor(codigo: string, mensagem: string) {
    super('CONFLITO', codigo, mensagem);
  }
}

export class NaoAutenticado extends ErroDeDominio {
  constructor(codigo = 'NAO_AUTENTICADO', mensagem = 'Autenticação necessária.') {
    super('NAO_AUTENTICADO', codigo, mensagem);
  }
}

export class AcessoNegado extends ErroDeDominio {
  constructor(codigo = 'ACESSO_NEGADO', mensagem = 'Você não tem permissão para esta operação.') {
    super('ACESSO_NEGADO', codigo, mensagem);
  }
}

export class Bloqueado extends ErroDeDominio {
  constructor(codigo: string, mensagem: string) {
    super('BLOQUEADO', codigo, mensagem);
  }
}
