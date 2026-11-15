import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, configurarAplicacao } from './app.module';

async function iniciar(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configuracao = app.get(ConfigService);
  configurarAplicacao(app);
  app.enableCors({ origin: configuracao.get<string>('URL_DO_FRONTEND', 'http://localhost:5173') });

  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Atletix')
      .setDescription('Gestão de academias com foco em controle de autenticação (monólito modular).')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('api/docs', app, documento);

  const porta = Number(configuracao.get('PORTA', 3000));
  await app.listen(porta);
  new Logger('Atletix').log(`API em http://localhost:${porta}/api (documentação em /api/docs)`);
}

void iniciar();
