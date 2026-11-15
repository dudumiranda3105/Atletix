import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTENTICADOR } from '../../compartilhado/seguranca/portas';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AuthController } from './api/auth.controller';
import { OuvinteDeUsuarios } from './api/ouvinte-de-usuarios';
import { AutenticadorPorToken } from './aplicacao/autenticador-por-token';
import { CadastrarConta } from './aplicacao/cadastrar-conta';
import { EncerrarSessao } from './aplicacao/encerrar-sessao';
import { Entrar } from './aplicacao/entrar';
import { RedefinirSenha } from './aplicacao/redefinir-senha';
import { RenovarSessao } from './aplicacao/renovar-sessao';
import { ServicoDeSessoes } from './aplicacao/servico-de-sessoes';
import { SolicitarRecuperacaoDeSenha } from './aplicacao/solicitar-recuperacao-de-senha';
import { TrocarSenha } from './aplicacao/trocar-senha';
import {
  EMISSOR_DE_TOKEN_DE_ACESSO,
  GERADOR_DE_TOKEN_OPACO,
  HASH_DE_SENHA,
  REPOSITORIO_DE_CREDENCIAIS,
  REPOSITORIO_DE_SESSOES,
  REPOSITORIO_DE_TOKENS_DE_RECUPERACAO,
} from './dominio/portas';
import { EmissorDeTokenJwt, GeradorDeTokenOpacoCrypto, HashDeSenhaBcrypt } from './infraestrutura/adaptadores';
import { CredencialModelo, SessaoModelo, TokenDeRecuperacaoModelo } from './infraestrutura/modelos';
import {
  RepositorioDeCredenciaisTypeorm,
  RepositorioDeSessoesTypeorm,
  RepositorioDeTokensDeRecuperacaoTypeorm,
} from './infraestrutura/repositorios-typeorm';

const SEGREDO_DE_DESENVOLVIMENTO = 'segredo-apenas-para-desenvolvimento';

/**
 * Módulo Identidade: responde "quem é o usuário?" (senha, tokens e sessões).
 * Para fora, oferece apenas a porta Autenticador e os eventos em contratos/eventos.ts.
 */
@Module({
  imports: [
    UsuariosModule,
    TypeOrmModule.forFeature([CredencialModelo, SessaoModelo, TokenDeRecuperacaoModelo]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configuracao: ConfigService) => {
        const segredo = configuracao.get<string>('JWT_SEGREDO');
        if (!segredo && process.env.NODE_ENV === 'production') {
          throw new Error('Defina JWT_SEGREDO para executar em produção.');
        }
        return { secret: segredo ?? SEGREDO_DE_DESENVOLVIMENTO };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    CadastrarConta,
    Entrar,
    RenovarSessao,
    EncerrarSessao,
    TrocarSenha,
    SolicitarRecuperacaoDeSenha,
    RedefinirSenha,
    ServicoDeSessoes,
    OuvinteDeUsuarios,
    { provide: REPOSITORIO_DE_CREDENCIAIS, useClass: RepositorioDeCredenciaisTypeorm },
    { provide: REPOSITORIO_DE_SESSOES, useClass: RepositorioDeSessoesTypeorm },
    { provide: REPOSITORIO_DE_TOKENS_DE_RECUPERACAO, useClass: RepositorioDeTokensDeRecuperacaoTypeorm },
    { provide: HASH_DE_SENHA, useClass: HashDeSenhaBcrypt },
    { provide: EMISSOR_DE_TOKEN_DE_ACESSO, useClass: EmissorDeTokenJwt },
    { provide: GERADOR_DE_TOKEN_OPACO, useClass: GeradorDeTokenOpacoCrypto },
    { provide: AUTENTICADOR, useClass: AutenticadorPorToken },
  ],
  exports: [AUTENTICADOR],
})
export class IdentidadeModule {}
