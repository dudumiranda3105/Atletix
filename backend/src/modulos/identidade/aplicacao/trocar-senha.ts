import { Inject, Injectable } from '@nestjs/common';
import { NaoAutenticado, RegraViolada } from '../../../compartilhado/dominio/erros';
import { PUBLICADOR_DE_EVENTOS, PublicadorDeEventos } from '../../../compartilhado/eventos/evento-de-dominio';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios } from '../../usuarios/contratos';
import { SenhaAlterada } from '../contratos/eventos';
import { validarSenha } from '../dominio/politica-de-senha';
import {
  HASH_DE_SENHA,
  HashDeSenha,
  REPOSITORIO_DE_CREDENCIAIS,
  RepositorioDeCredenciais,
} from '../dominio/portas';
import { ServicoDeSessoes } from './servico-de-sessoes';

/** Troca a senha do usuário logado e encerra todas as sessões abertas dele. */
@Injectable()
export class TrocarSenha {
  constructor(
    @Inject(DIRETORIO_DE_USUARIOS) private readonly usuarios: DiretorioDeUsuarios,
    @Inject(REPOSITORIO_DE_CREDENCIAIS) private readonly credenciais: RepositorioDeCredenciais,
    @Inject(HASH_DE_SENHA) private readonly hash: HashDeSenha,
    @Inject(PUBLICADOR_DE_EVENTOS) private readonly eventos: PublicadorDeEventos,
    @Inject(RELOGIO) private readonly relogio: Relogio,
    private readonly sessoes: ServicoDeSessoes,
  ) {}

  async executar(dados: { usuarioId: string; senhaAtual: string; novaSenha: string }): Promise<void> {
    const usuario = await this.usuarios.buscarPorId(dados.usuarioId);
    const credencial = await this.credenciais.buscarPorUsuario(dados.usuarioId);
    if (!usuario || !credencial) throw new NaoAutenticado();

    if (!(await this.hash.conferir(dados.senhaAtual, credencial.hashDaSenha))) {
      throw new RegraViolada('SENHA_ATUAL_INCORRETA', 'A senha atual está incorreta.');
    }
    validarSenha(dados.novaSenha);

    const agora = this.relogio.agora();
    credencial.definirSenha(await this.hash.gerar(dados.novaSenha), agora);
    await this.credenciais.salvar(credencial);
    await this.sessoes.revogarTodas(usuario.id);
    this.eventos.publicar(new SenhaAlterada(usuario.id, usuario.nome, usuario.email, agora));
  }
}
