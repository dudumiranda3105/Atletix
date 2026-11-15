import { EventoDeDominio } from '../../../compartilhado/eventos/evento-de-dominio';

export class MatriculaRegistrada extends EventoDeDominio {
  static readonly NOME = 'matriculas.matricula-registrada';
  readonly nome = MatriculaRegistrada.NOME;

  constructor(
    readonly alunoId: string,
    readonly plano: string,
    readonly validaAte: Date,
    readonly registradaPor: string,
    ocorridoEm: Date,
  ) {
    super(ocorridoEm);
  }
}
