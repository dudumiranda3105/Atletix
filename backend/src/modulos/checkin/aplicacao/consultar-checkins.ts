import { Inject, Injectable } from '@nestjs/common';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios } from '../../usuarios/contratos';
import { Checkin, intervaloDoDia, REPOSITORIO_DE_CHECKINS, RepositorioDeCheckins } from '../dominio/checkin';

export interface CheckinDoDia {
  id: string;
  alunoId: string;
  nomeDoAluno: string;
  registradoEm: Date;
}

@Injectable()
export class ConsultarCheckins {
  constructor(
    @Inject(REPOSITORIO_DE_CHECKINS) private readonly checkins: RepositorioDeCheckins,
    @Inject(DIRETORIO_DE_USUARIOS) private readonly usuarios: DiretorioDeUsuarios,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  /** Check-ins de hoje com o nome do aluno, obtido pelo contrato de Usuários (sem JOIN entre módulos). */
  async doDia(): Promise<CheckinDoDia[]> {
    const { inicio, fim } = intervaloDoDia(this.relogio.agora());
    const checkins = await this.checkins.listarNoIntervalo(inicio, fim);
    return Promise.all(
      checkins.map(async (c) => ({
        id: c.id,
        alunoId: c.alunoId,
        nomeDoAluno: (await this.usuarios.buscarPorId(c.alunoId))?.nome ?? 'Usuário removido',
        registradoEm: c.registradoEm,
      })),
    );
  }

  doAluno(alunoId: string): Promise<Checkin[]> {
    return this.checkins.listarDoAluno(alunoId, 30);
  }
}
