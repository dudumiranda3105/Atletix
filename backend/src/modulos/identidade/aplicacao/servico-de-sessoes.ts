import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import {
  EMISSOR_DE_TOKEN_DE_ACESSO,
  EmissorDeTokenDeAcesso,
  GERADOR_DE_TOKEN_OPACO,
  GeradorDeTokenOpaco,
  REPOSITORIO_DE_SESSOES,
  RepositorioDeSessoes,
} from '../dominio/portas';
import { Sessao } from '../dominio/sessao';

export interface TokensEmitidos {
  tokenDeAcesso: string;
  tokenDeRenovacao: string;
  expiraEmSegundos: number;
}

/** Abre e revoga sessões. Usado pelos casos de uso que precisam emitir ou invalidar tokens. */
@Injectable()
export class ServicoDeSessoes {
  private readonly validadeEmDias: number;

  constructor(
    @Inject(REPOSITORIO_DE_SESSOES) private readonly sessoes: RepositorioDeSessoes,
    @Inject(EMISSOR_DE_TOKEN_DE_ACESSO) private readonly emissor: EmissorDeTokenDeAcesso,
    @Inject(GERADOR_DE_TOKEN_OPACO) private readonly gerador: GeradorDeTokenOpaco,
    @Inject(RELOGIO) private readonly relogio: Relogio,
    configuracao: ConfigService,
  ) {
    this.validadeEmDias = Number(configuracao.get('SESSAO_DIAS', 7));
  }

  async abrir(usuarioId: string): Promise<TokensEmitidos> {
    const { token, hash } = this.gerador.gerar();
    const sessao = Sessao.nova(usuarioId, hash, this.relogio.agora(), this.validadeEmDias);
    await this.sessoes.salvar(sessao);
    const acesso = await this.emissor.emitir({ usuarioId, sessaoId: sessao.id });
    return { tokenDeAcesso: acesso.token, tokenDeRenovacao: token, expiraEmSegundos: acesso.expiraEmSegundos };
  }

  async revogarTodas(usuarioId: string): Promise<void> {
    await this.sessoes.revogarTodasDoUsuario(usuarioId, this.relogio.agora());
  }

  /** Uma sessão vale enquanto existir, pertencer ao usuário, não tiver sido revogada nem expirado. */
  async estaAtiva(sessaoId: string, usuarioId: string): Promise<boolean> {
    const sessao = await this.sessoes.buscarPorId(sessaoId);
    return (
      sessao !== null &&
      sessao.usuarioId === usuarioId &&
      !sessao.foiRevogada() &&
      !sessao.expirou(this.relogio.agora())
    );
  }
}
