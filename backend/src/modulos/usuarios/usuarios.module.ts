import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosController } from './api/usuarios.controller';
import { AlterarStatusDoUsuario } from './aplicacao/alterar-status-do-usuario';
import { CadastrarUsuario } from './aplicacao/cadastrar-usuario';
import { DiretorioDeUsuariosLocal } from './aplicacao/diretorio-de-usuarios-local';
import { DIRETORIO_DE_USUARIOS } from './contratos/diretorio-de-usuarios';
import { REPOSITORIO_DE_USUARIOS } from './dominio/repositorio-de-usuarios';
import { RepositorioDeUsuariosTypeorm } from './infraestrutura/repositorio-de-usuarios-typeorm';
import { UsuarioModelo } from './infraestrutura/usuario.modelo';

/**
 * Módulo Usuários: cadastro das pessoas e status da conta (ativa/inativa).
 * Exporta somente o contrato DiretorioDeUsuarios; todo o resto é privado.
 */
@Module({
  imports: [TypeOrmModule.forFeature([UsuarioModelo])],
  controllers: [UsuariosController],
  providers: [
    CadastrarUsuario,
    AlterarStatusDoUsuario,
    { provide: REPOSITORIO_DE_USUARIOS, useClass: RepositorioDeUsuariosTypeorm },
    { provide: DIRETORIO_DE_USUARIOS, useClass: DiretorioDeUsuariosLocal },
  ],
  exports: [DIRETORIO_DE_USUARIOS],
})
export class UsuariosModule {}
