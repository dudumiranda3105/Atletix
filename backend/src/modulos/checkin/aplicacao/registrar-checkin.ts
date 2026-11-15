import { Inject, Injectable } from '@nestjs/common';
import { Conflito, RegraViolada } from '../../../compartilhado/dominio/erros';
import { PUBLICADOR_DE_EVENTOS, PublicadorDeEventos } from '../../../compartilhado/eventos/evento-de-dominio';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import { CONSULTA_DE_MATRICULAS, ConsultaDeMatriculas } from '../../matriculas/contratos';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios } from '../../usuarios/contratos';
import { CheckinNegado, CheckinRegistrado } from '../contratos/eventos';
import { Checkin, intervaloDoDia, REPOSITORIO_DE_CHECKINS, RepositorioDeCheckins } from '../dominio/checkin';

/**
 * Libera a entrada do aluno. Este caso de uso não sabe como a identidade é verificada nem como a
 * matrícula é calculada: pergunta aos contratos de Usuários e Matrículas e aplica a regra do check-in.
 */
@Injectable()
export class RegistrarCheckin {
  constructor(
    @Inject(REPOSITORIO_DE_CHECKINS) private readonly checkins: RepositorioDeCheckins,
    @Inject(DIRETORIO_DE_USUARIOS) private readonly usuarios: DiretorioDeUsuarios,
    @Inject(CONSULTA_DE_MATRICULAS) private readonly matriculas: ConsultaDeMatriculas,
    @Inject(PUBLICADOR_DE_EVENTOS) private readonly eventos: PublicadorDeEventos,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  async executar(alunoId: string): Promise<Checkin> {
    const agora = this.relogio.agora();

    const aluno = await this.usuarios.buscarPorId(alunoId);
    if (!aluno?.ativo) {
      throw this.negar(alunoId, 'CONTA_INATIVA', 'Sua conta está desativada. Procure a recepção.', agora);
    }

    const situacao = await this.matriculas.situacaoDoAluno(alunoId);
    if (!situacao.ativa) {
      throw this.negar(alunoId, 'MATRICULA_INATIVA', 'Sua matrícula não está ativa. Procure a recepção.', agora);
    }

    const { inicio, fim } = intervaloDoDia(agora);
    if (await this.checkins.existeNoIntervalo(alunoId, inicio, fim)) {
      throw new Conflito('CHECKIN_JA_REGISTRADO', 'Você já fez check-in hoje.');
    }

    const checkin = Checkin.novo(alunoId, agora);
    await this.checkins.salvar(checkin);
    this.eventos.publicar(new CheckinRegistrado(alunoId, agora));
    return checkin;
  }

  private negar(alunoId: string, codigo: string, mensagem: string, agora: Date): RegraViolada {
    this.eventos.publicar(new CheckinNegado(alunoId, codigo, agora));
    return new RegraViolada(codigo, mensagem);
  }
}
