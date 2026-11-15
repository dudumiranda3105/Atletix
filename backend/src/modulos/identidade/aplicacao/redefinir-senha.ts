import { Inject, Injectable } from '@nestjs/common';
import { RegraViolada } from '../../../compartilhado/dominio/erros';
import { PUBLICADOR_DE_EVENTOS, PublicadorDeEventos } from '../../../compartilhado/eventos/evento-de-dominio';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios } from '../../usuarios/contratos';
import { SenhaRedefinida } from '../contratos/eventos';
import { validarSenha } from '../dominio/politica-de-senha';
import {
  GERADOR_DE_TOKEN_OPACO,
  GeradorDeTokenOpaco,
  HASH_DE_SENHA,
  HashDeSenha,
  REPOSITORIO_DE_CREDENCIAIS,
  REPOSITORIO_DE_TOKENS_DE_RECUPERACAO,
  RepositorioDeCredenciais,
  RepositorioDeTokensDeRecuperacao,
} from '../dominio/portas';
import { ServicoDeSessoes } from './servico-de-sessoes';

/** Define uma nova senha a partir do token recebido por e-mail (uso único, validade curta). */
@Injectable()
export class RedefinirSenha {
  constructor(
    @Inject(REPOSITORIO_DE_TOKENS_DE_RECUPERACAO) private readonly tokens: RepositorioDeTokensDeRecuperacao,
    @Inject(REPOSITORIO_DE_CREDENCIAIS) private readonly credenciais: RepositorioDeCredenciais,
    @Inject(DIRETORIO_DE_USUARIOS) private readonly usuarios: DiretorioDeUsuarios,
    @Inject(GERADOR_DE_TOKEN_OPACO) private readonly gerador: GeradorDeTokenOpaco,
    @Inject(HASH_DE_SENHA) private readonly hash: HashDeSenha,
    @Inject(PUBLICADOR_DE_EVENTOS) private readonly eventos: PublicadorDeEventos,
    @Inject(RELOGIO) private readonly relogio: Relogio,
    private readonly sessoes: ServicoDeSessoes,
  ) {}

  async executar(dados: { token: string; novaSenha: string }): Promise<void> {
    const agora = this.relogio.agora();
    const recuperacao = await this.tokens.buscarPorHash(this.gerador.resumir(dados.token));
    if (!recuperacao?.podeSerUsado(agora)) throw this.tokenInvalido();

    const usuario = await this.usuarios.buscarPorId(recuperacao.usuarioId);
    const credencial = await this.credenciais.buscarPorUsuario(recuperacao.usuarioId);
    if (!usuario?.ativo || !credencial) throw this.tokenInvalido();

    validarSenha(dados.novaSenha);
    credencial.definirSenha(await this.hash.gerar(dados.novaSenha), agora);
    recuperacao.marcarComoUsado(agora);
    await this.credenciais.salvar(credencial);
    await this.tokens.salvar(recuperacao);
    await this.sessoes.revogarTodas(usuario.id);
    this.eventos.publicar(new SenhaRedefinida(usuario.id, usuario.nome, usuario.email, agora));
  }

  private tokenInvalido(): RegraViolada {
    return new RegraViolada('TOKEN_DE_RECUPERACAO_INVALIDO', 'Link de redefinição inválido ou expirado.');
  }
}
