import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { MatriculasController } from './api/matriculas.controller';
import { ConsultarSituacao } from './aplicacao/consultar-situacao';
import { RegistrarMatricula } from './aplicacao/registrar-matricula';
import { CONSULTA_DE_MATRICULAS } from './contratos/consulta-de-matriculas';
import { REPOSITORIO_DE_MATRICULAS } from './dominio/matricula';
import {
  MatriculaModelo,
  RepositorioDeMatriculasTypeorm,
} from './infraestrutura/repositorio-de-matriculas-typeorm';

/**
 * Módulo Matrículas: plano e validade do vínculo do aluno com a academia.
 * Exporta somente o contrato ConsultaDeMatriculas.
 */
@Module({
  imports: [UsuariosModule, TypeOrmModule.forFeature([MatriculaModelo])],
  controllers: [MatriculasController],
  providers: [
    RegistrarMatricula,
    { provide: REPOSITORIO_DE_MATRICULAS, useClass: RepositorioDeMatriculasTypeorm },
    { provide: CONSULTA_DE_MATRICULAS, useClass: ConsultarSituacao },
  ],
  exports: [CONSULTA_DE_MATRICULAS],
})
export class MatriculasModule {}
