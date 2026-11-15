import { EventoDeDominio } from '../../../compartilhado/eventos/evento-de-dominio';
import { Papel } from './papel';

export class PapelAlterado extends EventoDeDominio {
  static readonly NOME = 'autorizacao.papel-alterado';
  readonly nome = PapelAlterado.NOME;

  constructor(
    readonly usuarioId: string,
    readonly papelAnterior: Papel,
    readonly papelNovo: Papel,
    readonly alteradoPor: string,
    ocorridoEm: Date,
  ) {
    super(ocorridoEm);
  }
}
