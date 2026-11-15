import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequerPermissao } from '../../../compartilhado/seguranca/decoradores';
import { ServicoDeNotificacoes } from '../aplicacao/servico-de-notificacoes';
import { PermissoesDeNotificacoes } from '../contratos/permissoes';

@ApiTags('Notificações')
@ApiBearerAuth()
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoes: ServicoDeNotificacoes) {}

  @Get('mensagens')
  @RequerPermissao(PermissoesDeNotificacoes.VER_CAIXA_DE_SAIDA)
  @ApiOperation({ summary: 'Caixa de saída do envio simulado de e-mails (para demonstração)' })
  async caixaDeSaida() {
    const mensagens = await this.notificacoes.caixaDeSaida();
    return mensagens.map((m) => ({
      id: m.id,
      destinatario: m.destinatario,
      assunto: m.assunto,
      corpo: m.corpo,
      criadaEm: m.criadaEm,
    }));
  }
}
