import { EventoDeDominio } from '../../../compartilhado/eventos/evento-de-dominio';

export class UsuarioCadastrado extends EventoDeDominio {
  static readonly NOME = 'usuarios.usuario-cadastrado';
  readonly nome = UsuarioCadastrado.NOME;

  constructor(
    readonly usuarioId: string,
    readonly email: string,
    ocorridoEm: Date,
  ) {
    super(ocorridoEm);
  }
}

export class UsuarioDesativado extends EventoDeDominio {
  static readonly NOME = 'usuarios.usuario-desativado';
  readonly nome = UsuarioDesativado.NOME;

  constructor(
    readonly usuarioId: string,
    readonly alteradoPor: string,
    ocorridoEm: Date,
  ) {
    super(ocorridoEm);
  }
}

export class UsuarioReativado extends EventoDeDominio {
  static readonly NOME = 'usuarios.usuario-reativado';
  readonly nome = UsuarioReativado.NOME;

  constructor(
    readonly usuarioId: string,
    readonly alteradoPor: string,
    ocorridoEm: Date,
  ) {
    super(ocorridoEm);
  }
}
