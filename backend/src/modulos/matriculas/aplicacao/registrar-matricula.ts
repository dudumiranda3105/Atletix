import { Inject, Injectable } from '@nestjs/common';
import { NaoEncontrado, RegraViolada } from '../../../compartilhado/dominio/erros';
import { PUBLICADOR_DE_EVENTOS, PublicadorDeEventos } from '../../../compartilhado/eventos/evento-de-dominio';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios } from '../../usuarios/contratos';
import { MatriculaRegistrada } from '../contratos/eventos';
import { Matricula, Plano, REPOSITORIO_DE_MATRICULAS, RepositorioDeMatriculas } from '../dominio/matricula';

@Injectable()
export class RegistrarMatricula {
  constructor(
    @Inject(REPOSITORIO_DE_MATRICULAS) private readonly matriculas: RepositorioDeMatriculas,
    @Inject(DIRETORIO_DE_USUARIOS) private readonly usuarios: DiretorioDeUsuarios,
    @Inject(PUBLICADOR_DE_EVENTOS) private readonly eventos: PublicadorDeEventos,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  async executar(dados: { alunoId: string; plano: Plano; registradaPor: string }): Promise<Matricula> {
    const aluno = await this.usuarios.buscarPorId(dados.alunoId);
    if (!aluno) throw new NaoEncontrado('USUARIO_NAO_ENCONTRADO', 'Aluno não encontrado.');
    if (!aluno.ativo) throw new RegraViolada('CONTA_INATIVA', 'A conta deste aluno está desativada.');

    const agora = this.relogio.agora();
    // Renovação: se ainda há matrícula valendo, a nova começa quando a atual terminar.
    const [maisRecente] = await this.matriculas.listarDoAluno(dados.alunoId);
    const inicioEm = maisRecente && maisRecente.validaAte > agora ? maisRecente.validaAte : agora;

    const matricula = Matricula.nova(dados.alunoId, dados.plano, inicioEm, agora);
    await this.matriculas.salvar(matricula);
    this.eventos.publicar(
      new MatriculaRegistrada(matricula.alunoId, matricula.plano, matricula.validaAte, dados.registradaPor, agora),
    );
    return matricula;
  }
}
