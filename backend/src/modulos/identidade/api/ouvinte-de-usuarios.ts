import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UsuarioDesativado } from '../../usuarios/contratos';
import { ServicoDeSessoes } from '../aplicacao/servico-de-sessoes';

/**
 * Reage a eventos do módulo Usuários. Usuários não conhece a Identidade: apenas publica
 * "usuário desativado", e a Identidade decide encerrar as sessões.
 */
@Injectable()
export class OuvinteDeUsuarios {
  constructor(private readonly sessoes: ServicoDeSessoes) {}

  @OnEvent(UsuarioDesativado.NOME)
  async aoDesativarUsuario(evento: UsuarioDesativado): Promise<void> {
    await this.sessoes.revogarTodas(evento.usuarioId);
  }
}
