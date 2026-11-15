import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORIO_DE_REGISTROS, RegistroDeAuditoria, RepositorioDeRegistros } from '../dominio/registro';

@Injectable()
export class ServicoDeAuditoria {
  constructor(@Inject(REPOSITORIO_DE_REGISTROS) private readonly registros: RepositorioDeRegistros) {}

  async registrar(dados: {
    tipo: string;
    usuarioId: string | null;
    descricao: string;
    ocorridoEm: Date;
  }): Promise<void> {
    await this.registros.salvar(RegistroDeAuditoria.novo(dados));
  }

  listarRecentes(limite: number): Promise<RegistroDeAuditoria[]> {
    return this.registros.listarRecentes(Math.min(Math.max(limite, 1), 500));
  }
}
