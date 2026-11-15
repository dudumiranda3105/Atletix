import { Inject, Injectable } from '@nestjs/common';
import { NaoEncontrado, RegraViolada } from '../../../compartilhado/dominio/erros';
import { PUBLICADOR_DE_EVENTOS, PublicadorDeEventos } from '../../../compartilhado/eventos/evento-de-dominio';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios } from '../../usuarios/contratos';
import { PapelAlterado } from '../contratos/eventos';
import { Papel } from '../contratos/papel';
import { PAPEL_PADRAO } from '../dominio/politica-de-acesso';
import {
  Atribuicao,
  REPOSITORIO_DE_ATRIBUICOES,
  RepositorioDeAtribuicoes,
} from '../dominio/repositorio-de-atribuicoes';

@Injectable()
export class AlterarPapel {
  constructor(
    @Inject(REPOSITORIO_DE_ATRIBUICOES) private readonly atribuicoes: RepositorioDeAtribuicoes,
    @Inject(DIRETORIO_DE_USUARIOS) private readonly usuarios: DiretorioDeUsuarios,
    @Inject(PUBLICADOR_DE_EVENTOS) private readonly eventos: PublicadorDeEventos,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  async executar(dados: { usuarioId: string; papel: Papel; alteradoPor: string }): Promise<Atribuicao> {
    if (!(await this.usuarios.buscarPorId(dados.usuarioId))) {
      throw new NaoEncontrado('USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado.');
    }

    const papelAtual = (await this.atribuicoes.buscarPorUsuario(dados.usuarioId))?.papel ?? PAPEL_PADRAO;
    const atribuicao: Atribuicao = { usuarioId: dados.usuarioId, papel: dados.papel };
    if (papelAtual === dados.papel) return atribuicao;

    if (papelAtual === Papel.ADMIN && !(await this.existeOutroAdministradorAtivo(dados.usuarioId))) {
      throw new RegraViolada(
        'ULTIMO_ADMINISTRADOR',
        'Este é o único administrador ativo. Promova outra pessoa antes de alterar este papel.',
      );
    }

    const agora = this.relogio.agora();
    await this.atribuicoes.salvar(atribuicao, agora);
    this.eventos.publicar(new PapelAlterado(dados.usuarioId, papelAtual, dados.papel, dados.alteradoPor, agora));
    return atribuicao;
  }

  private async existeOutroAdministradorAtivo(excetoUsuarioId: string): Promise<boolean> {
    const administradores = (await this.atribuicoes.listar()).filter(
      (a) => a.papel === Papel.ADMIN && a.usuarioId !== excetoUsuarioId,
    );
    for (const administrador of administradores) {
      if ((await this.usuarios.buscarPorId(administrador.usuarioId))?.ativo) return true;
    }
    return false;
  }
}
