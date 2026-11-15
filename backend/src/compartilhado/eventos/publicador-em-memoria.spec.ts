import { Injectable } from '@nestjs/common';
import { EventEmitterModule, OnEvent } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { EventoDeDominio } from './evento-de-dominio';
import { PublicadorEmMemoria } from './publicador-em-memoria';

class AlgoAconteceu extends EventoDeDominio {
  static readonly NOME = 'teste.algo-aconteceu';
  readonly nome = AlgoAconteceu.NOME;

  constructor() {
    super(new Date());
  }
}

@Injectable()
class AssinanteQueFalha {
  @OnEvent(AlgoAconteceu.NOME)
  async aoAcontecer(): Promise<void> {
    throw new Error('falha de propósito no assinante');
  }
}

@Injectable()
class AssinanteSaudavel {
  recebidos = 0;

  @OnEvent(AlgoAconteceu.NOME)
  async aoAcontecer(): Promise<void> {
    this.recebidos += 1;
  }
}

describe('PublicadorEmMemoria', () => {
  it('uma falha em quem assina não afeta quem publica nem os outros assinantes', async () => {
    const modulo = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [PublicadorEmMemoria, AssinanteQueFalha, AssinanteSaudavel],
    }).compile();
    modulo.useLogger(false);
    await modulo.init();
    const rejeicoes: unknown[] = [];
    const aoRejeitar = (motivo: unknown) => rejeicoes.push(motivo);
    process.on('unhandledRejection', aoRejeitar);

    expect(() => modulo.get(PublicadorEmMemoria).publicar(new AlgoAconteceu())).not.toThrow();
    await new Promise((resolver) => setTimeout(resolver, 50));

    process.off('unhandledRejection', aoRejeitar);
    expect(modulo.get(AssinanteSaudavel).recebidos).toBe(1);
    expect(rejeicoes).toHaveLength(0);
    await modulo.close();
  });
});
