import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ContaBloqueada,
  RecuperacaoDeSenhaSolicitada,
  SenhaAlterada,
  SenhaRedefinida,
} from '../../identidade/contratos';
import { ServicoDeNotificacoes } from '../aplicacao/servico-de-notificacoes';

/**
 * Transforma eventos da Identidade em e-mails. A Identidade não sabe que este módulo existe.
 * Os dados do destinatário vêm no próprio evento, então não há consulta a outros módulos.
 */
@Injectable()
export class OuvinteDeIdentidade {
  private readonly urlDoFrontend: string;

  constructor(
    private readonly notificacoes: ServicoDeNotificacoes,
    configuracao: ConfigService,
  ) {
    this.urlDoFrontend = configuracao.get<string>('URL_DO_FRONTEND', 'http://localhost:5173');
  }

  @OnEvent(RecuperacaoDeSenhaSolicitada.NOME)
  async aoSolicitarRecuperacao(evento: RecuperacaoDeSenhaSolicitada): Promise<void> {
    const link = `${this.urlDoFrontend}/redefinir-senha?token=${encodeURIComponent(evento.token)}`;
    const validade = evento.expiraEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    await this.notificacoes.notificar({
      destinatario: evento.email,
      assunto: 'Atletix: redefinição de senha',
      corpo:
        `Olá, ${evento.nomeDoUsuario}.\n\n` +
        `Para criar uma nova senha, acesse o link abaixo (válido até ${validade}, uso único):\n${link}\n\n` +
        'Se você não pediu a redefinição, ignore este e-mail.',
    });
  }

  @OnEvent(ContaBloqueada.NOME)
  async aoBloquearConta(evento: ContaBloqueada): Promise<void> {
    const ate = evento.bloqueadaAte.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    await this.notificacoes.notificar({
      destinatario: evento.email,
      assunto: 'Atletix: conta bloqueada temporariamente',
      corpo:
        `Olá, ${evento.nomeDoUsuario}.\n\n` +
        `Sua conta foi bloqueada até ${ate} após várias tentativas de login com senha incorreta.\n` +
        'Se não foi você, redefina a sua senha.',
    });
  }

  @OnEvent(SenhaAlterada.NOME)
  async aoAlterarSenha(evento: SenhaAlterada): Promise<void> {
    await this.avisarSobreNovaSenha(evento.email, evento.nomeDoUsuario);
  }

  @OnEvent(SenhaRedefinida.NOME)
  async aoRedefinirSenha(evento: SenhaRedefinida): Promise<void> {
    await this.avisarSobreNovaSenha(evento.email, evento.nomeDoUsuario);
  }

  private avisarSobreNovaSenha(email: string, nome: string): Promise<void> {
    return this.notificacoes.notificar({
      destinatario: email,
      assunto: 'Atletix: sua senha foi alterada',
      corpo:
        `Olá, ${nome}.\n\n` +
        'A senha da sua conta foi alterada e todas as sessões abertas foram encerradas.\n' +
        'Se não foi você, procure a recepção imediatamente.',
    });
  }
}
