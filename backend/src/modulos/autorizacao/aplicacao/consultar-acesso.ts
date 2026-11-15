import { Inject, Injectable } from '@nestjs/common';
import { Autorizador } from '../../../compartilhado/seguranca/portas';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios } from '../../usuarios/contratos';
import { Papel } from '../contratos/papel';
import { PAPEL_PADRAO, papelPermite, permissoesDoPapel } from '../dominio/politica-de-acesso';
import {
  Atribuicao,
  REPOSITORIO_DE_ATRIBUICOES,
  RepositorioDeAtribuicoes,
} from '../dominio/repositorio-de-atribuicoes';

/**
 * Consultas de acesso. Também implementa a porta Autorizador usada pelo guarda global.
 * O papel é lido a cada verificação, então uma troca de papel vale já na próxima requisição.
 */
@Injectable()
export class ConsultarAcesso implements Autorizador {
  constructor(
    @Inject(REPOSITORIO_DE_ATRIBUICOES) private readonly atribuicoes: RepositorioDeAtribuicoes,
    @Inject(DIRETORIO_DE_USUARIOS) private readonly usuarios: DiretorioDeUsuarios,
  ) {}

  async papelDoUsuario(usuarioId: string): Promise<Papel> {
    return (await this.atribuicoes.buscarPorUsuario(usuarioId))?.papel ?? PAPEL_PADRAO;
  }

  async possuiPermissao(usuarioId: string, permissao: string): Promise<boolean> {
    return papelPermite(await this.papelDoUsuario(usuarioId), permissao);
  }

  async acessoDoUsuario(usuarioId: string): Promise<{ papel: Papel; permissoes: string[] }> {
    const papel = await this.papelDoUsuario(usuarioId);
    return { papel, permissoes: permissoesDoPapel(papel) };
  }

  /** Papel de todos os usuários cadastrados, incluindo quem está com o papel padrão. */
  async listarAtribuicoes(): Promise<Atribuicao[]> {
    const explicitas = new Map((await this.atribuicoes.listar()).map((a) => [a.usuarioId, a.papel]));
    const usuarios = await this.usuarios.listar();
    return usuarios.map((u) => ({ usuarioId: u.id, papel: explicitas.get(u.id) ?? PAPEL_PADRAO }));
  }
}
