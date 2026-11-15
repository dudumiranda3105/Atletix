import { Inject, Injectable } from '@nestjs/common';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import {
  ENVIADOR_DE_EMAIL,
  EnviadorDeEmail,
  Mensagem,
  REPOSITORIO_DE_MENSAGENS,
  RepositorioDeMensagens,
} from '../dominio/mensagem';

@Injectable()
export class ServicoDeNotificacoes {
  constructor(
    @Inject(REPOSITORIO_DE_MENSAGENS) private readonly mensagens: RepositorioDeMensagens,
    @Inject(ENVIADOR_DE_EMAIL) private readonly enviador: EnviadorDeEmail,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  /** Guarda a mensagem na caixa de saída e a entrega pelo adaptador de e-mail configurado. */
  async notificar(dados: { destinatario: string; assunto: string; corpo: string }): Promise<void> {
    const mensagem = Mensagem.nova(dados, this.relogio.agora());
    await this.mensagens.salvar(mensagem);
    await this.enviador.enviar(mensagem);
  }

  caixaDeSaida(): Promise<Mensagem[]> {
    return this.mensagens.listarRecentes(50);
  }
}
