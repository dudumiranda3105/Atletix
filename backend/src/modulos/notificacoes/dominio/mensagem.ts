import { randomUUID } from 'node:crypto';

/** Mensagem enviada a um usuário (hoje, sempre por e-mail). */
export class Mensagem {
  constructor(
    readonly id: string,
    readonly destinatario: string,
    readonly assunto: string,
    readonly corpo: string,
    readonly criadaEm: Date,
  ) {}

  static nova(dados: { destinatario: string; assunto: string; corpo: string }, agora: Date): Mensagem {
    return new Mensagem(randomUUID(), dados.destinatario, dados.assunto, dados.corpo, agora);
  }
}

export const REPOSITORIO_DE_MENSAGENS = Symbol('REPOSITORIO_DE_MENSAGENS');
export interface RepositorioDeMensagens {
  salvar(mensagem: Mensagem): Promise<void>;
  listarRecentes(limite: number): Promise<Mensagem[]>;
}

/** Porta de saída: trocar o envio simulado por SMTP é trocar a implementação desta interface. */
export const ENVIADOR_DE_EMAIL = Symbol('ENVIADOR_DE_EMAIL');
export interface EnviadorDeEmail {
  enviar(mensagem: Mensagem): Promise<void>;
}
