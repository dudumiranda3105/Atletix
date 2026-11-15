import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaController } from './api/auditoria.controller';
import { OuvinteDeEventos } from './api/ouvinte-de-eventos';
import { ServicoDeAuditoria } from './aplicacao/servico-de-auditoria';
import { REPOSITORIO_DE_REGISTROS } from './dominio/registro';
import { RegistroModelo, RepositorioDeRegistrosTypeorm } from './infraestrutura/repositorio-de-registros-typeorm';

/**
 * Módulo Auditoria: trilha de eventos de segurança.
 * Só assina eventos dos outros módulos; ninguém depende dele.
 */
@Module({
  imports: [TypeOrmModule.forFeature([RegistroModelo])],
  controllers: [AuditoriaController],
  providers: [
    ServicoDeAuditoria,
    OuvinteDeEventos,
    { provide: REPOSITORIO_DE_REGISTROS, useClass: RepositorioDeRegistrosTypeorm },
  ],
})
export class AuditoriaModule {}
