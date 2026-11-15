import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiltroDeErros } from './compartilhado/http/filtro-de-erros';
import { NucleoModule } from './compartilhado/nucleo.module';
import { GuardaDeSeguranca } from './compartilhado/seguranca/guarda-de-seguranca';
import { AuditoriaModule } from './modulos/auditoria/auditoria.module';
import { AutorizacaoModule } from './modulos/autorizacao/autorizacao.module';
import { CheckinModule } from './modulos/checkin/checkin.module';
import { IdentidadeModule } from './modulos/identidade/identidade.module';
import { MatriculasModule } from './modulos/matriculas/matriculas.module';
import { NotificacoesModule } from './modulos/notificacoes/notificacoes.module';
import { UsuariosModule } from './modulos/usuarios/usuarios.module';

/**
 * Raiz de composição do monólito modular: único lugar que conhece todos os módulos.
 *
 * O guarda de segurança é registrado aqui porque combina duas portas implementadas por módulos
 * diferentes: Autenticador (Identidade) e Autorizador (Autorização).
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configuracao: ConfigService) => {
        const arquivo = configuracao.get<string>('BANCO_ARQUIVO', 'dados/atletix.sqlite');
        if (arquivo !== ':memory:') mkdirSync(dirname(arquivo), { recursive: true });
        // synchronize cria as tabelas a partir dos modelos; em produção seriam usadas migrations.
        return { type: 'better-sqlite3' as const, database: arquivo, autoLoadEntities: true, synchronize: true };
      },
    }),
    NucleoModule,
    UsuariosModule,
    IdentidadeModule,
    AutorizacaoModule,
    MatriculasModule,
    CheckinModule,
    NotificacoesModule,
    AuditoriaModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: GuardaDeSeguranca },
    { provide: APP_FILTER, useClass: FiltroDeErros },
  ],
})
export class AppModule {}

/** Configuração HTTP comum à aplicação real e aos testes de ponta a ponta. */
export function configurarAplicacao(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
}
