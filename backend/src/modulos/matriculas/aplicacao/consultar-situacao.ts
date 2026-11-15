import { Inject, Injectable } from '@nestjs/common';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import { ConsultaDeMatriculas, SituacaoDaMatricula } from '../contratos/consulta-de-matriculas';
import { REPOSITORIO_DE_MATRICULAS, RepositorioDeMatriculas } from '../dominio/matricula';

/** Implementação em processo do contrato ConsultaDeMatriculas. */
@Injectable()
export class ConsultarSituacao implements ConsultaDeMatriculas {
  constructor(
    @Inject(REPOSITORIO_DE_MATRICULAS) private readonly matriculas: RepositorioDeMatriculas,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  async situacaoDoAluno(alunoId: string): Promise<SituacaoDaMatricula> {
    const agora = this.relogio.agora();
    const historico = await this.matriculas.listarDoAluno(alunoId);
    const vigente = historico.find((m) => m.estaAtiva(agora));
    const referencia = vigente ?? historico[0];
    return {
      ativa: vigente !== undefined,
      plano: referencia?.plano ?? null,
      validaAte: historico[0]?.validaAte ?? null,
    };
  }
}
