import { randomUUID } from 'node:crypto';

/** Um fato relevante para a segurança, guardado para consulta posterior. Nunca é alterado. */
export class RegistroDeAuditoria {
  constructor(
    readonly id: string,
    readonly tipo: string,
    readonly usuarioId: string | null,
    readonly descricao: string,
    readonly ocorridoEm: Date,
  ) {}

  static novo(dados: { tipo: string; usuarioId: string | null; descricao: string; ocorridoEm: Date }) {
    return new RegistroDeAuditoria(randomUUID(), dados.tipo, dados.usuarioId, dados.descricao, dados.ocorridoEm);
  }
}

export const REPOSITORIO_DE_REGISTROS = Symbol('REPOSITORIO_DE_REGISTROS');

export interface RepositorioDeRegistros {
  salvar(registro: RegistroDeAuditoria): Promise<void>;
  listarRecentes(limite: number): Promise<RegistroDeAuditoria[]>;
}
