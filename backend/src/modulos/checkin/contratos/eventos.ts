import { EventoDeDominio } from '../../../compartilhado/eventos/evento-de-dominio';

export class CheckinRegistrado extends EventoDeDominio {
  static readonly NOME = 'checkin.checkin-registrado';
  readonly nome = CheckinRegistrado.NOME;

  constructor(
    readonly alunoId: string,
    ocorridoEm: Date,
  ) {
    super(ocorridoEm);
  }
}

export class CheckinNegado extends EventoDeDominio {
  static readonly NOME = 'checkin.checkin-negado';
  readonly nome = CheckinNegado.NOME;

  constructor(
    readonly alunoId: string,
    readonly motivo: string,
    ocorridoEm: Date,
  ) {
    super(ocorridoEm);
  }
}
