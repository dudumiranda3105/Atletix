import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatriculasModule } from '../matriculas/matriculas.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { CheckinController } from './api/checkin.controller';
import { ConsultarCheckins } from './aplicacao/consultar-checkins';
import { RegistrarCheckin } from './aplicacao/registrar-checkin';
import { REPOSITORIO_DE_CHECKINS } from './dominio/checkin';
import { CheckinModelo, RepositorioDeCheckinsTypeorm } from './infraestrutura/repositorio-de-checkins-typeorm';

/**
 * Módulo Check-in: registra a entrada do aluno.
 * Consome os contratos de Usuários e Matrículas; não exporta nada além dos seus eventos.
 */
@Module({
  imports: [UsuariosModule, MatriculasModule, TypeOrmModule.forFeature([CheckinModelo])],
  controllers: [CheckinController],
  providers: [
    RegistrarCheckin,
    ConsultarCheckins,
    { provide: REPOSITORIO_DE_CHECKINS, useClass: RepositorioDeCheckinsTypeorm },
  ],
})
export class CheckinModule {}
