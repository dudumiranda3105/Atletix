/**
 * Base dos eventos de domínio trocados entre módulos.
 *
 * Cada módulo publica seus eventos em "<modulo>/contratos/eventos.ts". Quem publica não conhece
 * quem assina: o único acoplamento entre os dois lados é o nome e o formato do evento.
 */
export abstract class EventoDeDominio {
  abstract readonly nome: string;
  readonly ocorridoEm: Date;

  protected constructor(ocorridoEm: Date) {
    this.ocorridoEm = ocorridoEm;
  }
}

export const PUBLICADOR_DE_EVENTOS = Symbol('PUBLICADOR_DE_EVENTOS');

export interface PublicadorDeEventos {
  /** Publica sem esperar pelos assinantes: uma falha em quem assina não afeta quem publica. */
  publicar(evento: EventoDeDominio): void;
}
