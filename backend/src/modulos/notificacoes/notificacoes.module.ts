import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacoesController } from './api/notificacoes.controller';
import { OuvinteDeIdentidade } from './api/ouvinte-de-identidade';
import { ServicoDeNotificacoes } from './aplicacao/servico-de-notificacoes';
import { ENVIADOR_DE_EMAIL, REPOSITORIO_DE_MENSAGENS } from './dominio/mensagem';
import {
  EnviadorDeEmailSimulado,
  MensagemModelo,
  RepositorioDeMensagensTypeorm,
} from './infraestrutura/adaptadores';

/**
 * Módulo Notificações: envia mensagens aos usuários em reação a eventos.
 * Nenhum módulo o chama diretamente; ele apenas assina eventos da Identidade.
 */
@Module({
  imports: [TypeOrmModule.forFeature([MensagemModelo])],
  controllers: [NotificacoesController],
  providers: [
    ServicoDeNotificacoes,
    OuvinteDeIdentidade,
    { provide: REPOSITORIO_DE_MENSAGENS, useClass: RepositorioDeMensagensTypeorm },
    { provide: ENVIADOR_DE_EMAIL, useClass: EnviadorDeEmailSimulado },
  ],
})
export class NotificacoesModule {}
