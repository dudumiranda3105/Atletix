import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTORIZADOR } from '../../compartilhado/seguranca/portas';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AutorizacaoController } from './api/autorizacao.controller';
import { AlterarPapel } from './aplicacao/alterar-papel';
import { ConsultarAcesso } from './aplicacao/consultar-acesso';
import { REPOSITORIO_DE_ATRIBUICOES } from './dominio/repositorio-de-atribuicoes';
import {
  AtribuicaoModelo,
  RepositorioDeAtribuicoesTypeorm,
} from './infraestrutura/repositorio-de-atribuicoes-typeorm';

/**
 * Módulo Autorização: responde "o que o usuário pode fazer?" (papéis e política de permissões).
 * Para fora, oferece apenas a porta Autorizador, o enum Papel e o evento PapelAlterado.
 */
@Module({
  imports: [UsuariosModule, TypeOrmModule.forFeature([AtribuicaoModelo])],
  controllers: [AutorizacaoController],
  providers: [
    ConsultarAcesso,
    AlterarPapel,
    { provide: REPOSITORIO_DE_ATRIBUICOES, useClass: RepositorioDeAtribuicoesTypeorm },
    { provide: AUTORIZADOR, useExisting: ConsultarAcesso },
  ],
  exports: [AUTORIZADOR],
})
export class AutorizacaoModule {}
