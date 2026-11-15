import { EventoDeDominio } from '../../../compartilhado/eventos/evento-de-dominio';

/**
 * Eventos publicados pelo módulo Identidade.
 *
 * Os eventos que geram e-mail carregam nome e e-mail do usuário (event-carried state transfer):
 * assim Notificações não precisa consultar o módulo Usuários para montar a mensagem.
 */
export class LoginRealizado extends EventoDeDominio {
  static readonly NOME = 'identidade.login-realizado';
  readonly nome = LoginRealizado.NOME;

  constructor(
    readonly usuarioId: string,
    ocorridoEm: Date,
  ) {
    super(ocorridoEm);
  }
}

export class LoginFalhou extends EventoDeDominio {
  static readonly NOME = 'identidade.login-falhou';
  readonly nome = LoginFalhou.NOME;

  constructor(
    readonly email: string,
    readonly usuarioId: string | null,
    ocorridoEm: Date,
  ) {
    super(ocorridoEm);
  }
}

export class ContaBloqueada extends EventoDeDominio {
  static readonly NOME = 'identidade.conta-bloqueada';
  readonly nome = ContaBloqueada.NOME;

  constructor(
    readonly usuarioId: string,
    readonly nomeDoUsuario: string,
    readonly email: string,
    readonly bloqueadaAte: Date,
    ocorridoEm: Date,
  ) {
    super(ocorridoEm);
  }
}

export class SessaoEncerrada extends EventoDeDominio {
  static readonly NOME = 'identidade.sessao-encerrada';
  readonly nome = SessaoEncerrada.NOME;

  constructor(
    readonly usuarioId: string,
    ocorridoEm: Date,
  ) {
    super(ocorridoEm);
  }
}

export class SenhaAlterada extends EventoDeDominio {
  static readonly NOME = 'identidade.senha-alterada';
  readonly nome = SenhaAlterada.NOME;

  constructor(
    readonly usuarioId: string,
    readonly nomeDoUsuario: string,
    readonly email: string,
    ocorridoEm: Date,
  ) {
    super(ocorridoEm);
  }
}

export class RecuperacaoDeSenhaSolicitada extends EventoDeDominio {
  static readonly NOME = 'identidade.recuperacao-de-senha-solicitada';
  readonly nome = RecuperacaoDeSenhaSolicitada.NOME;

  constructor(
    readonly usuarioId: string,
    readonly nomeDoUsuario: string,
    readonly email: string,
    /** Token de uso único em texto puro: existe apenas neste evento e no e-mail enviado. */
    readonly token: string,
    readonly expiraEm: Date,
    ocorridoEm: Date,
  ) {
    super(ocorridoEm);
  }
}

export class SenhaRedefinida extends EventoDeDominio {
  static readonly NOME = 'identidade.senha-redefinida';
  readonly nome = SenhaRedefinida.NOME;

  constructor(
    readonly usuarioId: string,
    readonly nomeDoUsuario: string,
    readonly email: string,
    ocorridoEm: Date,
  ) {
    super(ocorridoEm);
  }
}
