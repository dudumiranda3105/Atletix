import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventoDeDominio, PublicadorDeEventos } from './evento-de-dominio';

/**
 * Barramento de eventos interno (em memória). Para extrair um módulo como serviço, basta trocar
 * esta implementação por um adaptador de broker (ex.: RabbitMQ) sem alterar quem publica.
 */
@Injectable()
export class PublicadorEmMemoria implements PublicadorDeEventos {
  constructor(private readonly emissor: EventEmitter2) {}

  publicar(evento: EventoDeDominio): void {
    this.emissor.emit(evento.nome, evento);
  }
}
