import { Inject, Injectable } from '@nestjs/common';
import { PUBLICADOR_DE_EVENTOS, PublicadorDeEventos } from '../../../compartilhado/eventos/evento-de-dominio';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import { SessaoEncerrada } from '../contratos/eventos';
import {
  GERADOR_DE_TOKEN_OPACO,
  GeradorDeTokenOpaco,
  REPOSITORIO_DE_SESSOES,
  RepositorioDeSessoes,
} from '../dominio/portas';

/** Logout: revoga a sessão do token informado. Repetir a chamada não causa erro. */
@Injectable()
export class EncerrarSessao {
  constructor(
    @Inject(REPOSITORIO_DE_SESSOES) private readonly repositorio: RepositorioDeSessoes,
    @Inject(GERADOR_DE_TOKEN_OPACO) private readonly gerador: GeradorDeTokenOpaco,
    @Inject(PUBLICADOR_DE_EVENTOS) private readonly eventos: PublicadorDeEventos,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  async executar(tokenDeRenovacao: string): Promise<void> {
    const sessao = await this.repositorio.buscarPorHash(this.gerador.resumir(tokenDeRenovacao));
    if (!sessao || sessao.foiRevogada()) return;
    const agora = this.relogio.agora();
    sessao.revogar(agora);
    await this.repositorio.salvar(sessao);
    this.eventos.publicar(new SessaoEncerrada(sessao.usuarioId, agora));
  }
}
