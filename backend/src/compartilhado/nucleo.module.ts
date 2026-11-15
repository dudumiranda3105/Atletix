import { Global, Module } from '@nestjs/common';
import { PUBLICADOR_DE_EVENTOS } from './eventos/evento-de-dominio';
import { PublicadorEmMemoria } from './eventos/publicador-em-memoria';
import { RELOGIO, RelogioDoSistema } from './tempo/relogio';

/**
 * Núcleo compartilhado: vocabulário pequeno e estável que todos os módulos podem usar
 * (erros de domínio, eventos, relógio e portas de segurança). Não depende de nenhum módulo.
 */
@Global()
@Module({
  providers: [
    { provide: PUBLICADOR_DE_EVENTOS, useClass: PublicadorEmMemoria },
    { provide: RELOGIO, useClass: RelogioDoSistema },
  ],
  exports: [PUBLICADOR_DE_EVENTOS, RELOGIO],
})
export class NucleoModule {}
