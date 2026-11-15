import { Inject, Injectable } from '@nestjs/common';
import { NaoAutenticado } from '../../../compartilhado/dominio/erros';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios } from '../../usuarios/contratos';
import {
  GERADOR_DE_TOKEN_OPACO,
  GeradorDeTokenOpaco,
  REPOSITORIO_DE_SESSOES,
  RepositorioDeSessoes,
} from '../dominio/portas';
import { ServicoDeSessoes, TokensEmitidos } from './servico-de-sessoes';

/** Troca um token de renovação por um novo par de tokens (rotação: o token usado deixa de valer). */
@Injectable()
export class RenovarSessao {
  constructor(
    @Inject(REPOSITORIO_DE_SESSOES) private readonly repositorio: RepositorioDeSessoes,
    @Inject(GERADOR_DE_TOKEN_OPACO) private readonly gerador: GeradorDeTokenOpaco,
    @Inject(DIRETORIO_DE_USUARIOS) private readonly usuarios: DiretorioDeUsuarios,
    @Inject(RELOGIO) private readonly relogio: Relogio,
    private readonly sessoes: ServicoDeSessoes,
  ) {}

  async executar(tokenDeRenovacao: string): Promise<TokensEmitidos> {
    const agora = this.relogio.agora();
    const sessao = await this.repositorio.buscarPorHash(this.gerador.resumir(tokenDeRenovacao));
    if (!sessao) throw this.sessaoInvalida();

    if (sessao.foiRevogada()) {
      // Um token já usado apareceu de novo: pode ter sido roubado. Encerra tudo por segurança.
      await this.sessoes.revogarTodas(sessao.usuarioId);
      throw this.sessaoInvalida();
    }
    if (sessao.expirou(agora)) throw this.sessaoInvalida();

    const usuario = await this.usuarios.buscarPorId(sessao.usuarioId);
    if (!usuario?.ativo) throw this.sessaoInvalida();

    sessao.revogar(agora);
    await this.repositorio.salvar(sessao);
    return this.sessoes.abrir(sessao.usuarioId);
  }

  private sessaoInvalida(): NaoAutenticado {
    return new NaoAutenticado('SESSAO_INVALIDA', 'Sessão inválida ou expirada. Entre novamente.');
  }
}
