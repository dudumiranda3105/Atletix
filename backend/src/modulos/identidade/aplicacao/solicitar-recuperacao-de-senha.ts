import { Inject, Injectable } from '@nestjs/common';
import { PUBLICADOR_DE_EVENTOS, PublicadorDeEventos } from '../../../compartilhado/eventos/evento-de-dominio';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios } from '../../usuarios/contratos';
import { RecuperacaoDeSenhaSolicitada } from '../contratos/eventos';
import {
  GERADOR_DE_TOKEN_OPACO,
  GeradorDeTokenOpaco,
  REPOSITORIO_DE_TOKENS_DE_RECUPERACAO,
  RepositorioDeTokensDeRecuperacao,
} from '../dominio/portas';
import { TokenDeRecuperacao } from '../dominio/token-de-recuperacao';

/**
 * Gera o token de redefinição e publica o evento. O envio do e-mail é feito por quem assina
 * o evento (Notificações); a Identidade não sabe como nem por onde a mensagem sai.
 */
@Injectable()
export class SolicitarRecuperacaoDeSenha {
  constructor(
    @Inject(DIRETORIO_DE_USUARIOS) private readonly usuarios: DiretorioDeUsuarios,
    @Inject(REPOSITORIO_DE_TOKENS_DE_RECUPERACAO) private readonly tokens: RepositorioDeTokensDeRecuperacao,
    @Inject(GERADOR_DE_TOKEN_OPACO) private readonly gerador: GeradorDeTokenOpaco,
    @Inject(PUBLICADOR_DE_EVENTOS) private readonly eventos: PublicadorDeEventos,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  /** Não informa se o e-mail existe: a resposta é a mesma nos dois casos. */
  async executar(email: string): Promise<void> {
    const usuario = await this.usuarios.buscarPorEmail(email);
    if (!usuario?.ativo) return;

    const agora = this.relogio.agora();
    const { token, hash } = this.gerador.gerar();
    const recuperacao = TokenDeRecuperacao.novo(usuario.id, hash, agora);
    await this.tokens.salvar(recuperacao);
    this.eventos.publicar(
      new RecuperacaoDeSenhaSolicitada(usuario.id, usuario.nome, usuario.email, token, recuperacao.expiraEm, agora),
    );
  }
}
