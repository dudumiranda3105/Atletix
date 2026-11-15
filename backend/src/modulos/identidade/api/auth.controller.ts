import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NaoAutenticado } from '../../../compartilhado/dominio/erros';
import { RotaPublica, UsuarioAtual } from '../../../compartilhado/seguranca/decoradores';
import { UsuarioAutenticado } from '../../../compartilhado/seguranca/portas';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios, UsuarioResumo } from '../../usuarios/contratos';
import { CadastrarConta } from '../aplicacao/cadastrar-conta';
import { EncerrarSessao } from '../aplicacao/encerrar-sessao';
import { Entrar } from '../aplicacao/entrar';
import { RedefinirSenha } from '../aplicacao/redefinir-senha';
import { RenovarSessao } from '../aplicacao/renovar-sessao';
import { TokensEmitidos } from '../aplicacao/servico-de-sessoes';
import { SolicitarRecuperacaoDeSenha } from '../aplicacao/solicitar-recuperacao-de-senha';
import { TrocarSenha } from '../aplicacao/trocar-senha';
import {
  CadastroDto,
  EntrarDto,
  RecuperarSenhaDto,
  RedefinirSenhaDto,
  TokenDeRenovacaoDto,
  TrocarSenhaDto,
} from './dto';

@ApiTags('Identidade')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly cadastrarConta: CadastrarConta,
    private readonly entrar: Entrar,
    private readonly renovarSessao: RenovarSessao,
    private readonly encerrarSessao: EncerrarSessao,
    private readonly trocarSenha: TrocarSenha,
    private readonly solicitarRecuperacao: SolicitarRecuperacaoDeSenha,
    private readonly redefinirSenha: RedefinirSenha,
    @Inject(DIRETORIO_DE_USUARIOS) private readonly usuarios: DiretorioDeUsuarios,
  ) {}

  @Post('cadastro')
  @RotaPublica()
  @ApiOperation({ summary: 'Cria uma conta (sempre com o papel ALUNO)' })
  cadastro(@Body() dto: CadastroDto): Promise<UsuarioResumo> {
    return this.cadastrarConta.executar(dto);
  }

  @Post('entrar')
  @RotaPublica()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login com e-mail e senha' })
  login(@Body() dto: EntrarDto): Promise<TokensEmitidos> {
    return this.entrar.executar(dto);
  }

  @Post('renovar')
  @RotaPublica()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Troca o token de renovação por um novo par de tokens' })
  renovar(@Body() dto: TokenDeRenovacaoDto): Promise<TokensEmitidos> {
    return this.renovarSessao.executar(dto.tokenDeRenovacao);
  }

  @Post('sair')
  @RotaPublica()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout: revoga o token de renovação' })
  async sair(@Body() dto: TokenDeRenovacaoDto): Promise<void> {
    await this.encerrarSessao.executar(dto.tokenDeRenovacao);
  }

  @Get('eu')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados da conta autenticada' })
  async eu(@UsuarioAtual() atual: UsuarioAutenticado): Promise<UsuarioResumo> {
    const usuario = await this.usuarios.buscarPorId(atual.id);
    if (!usuario) throw new NaoAutenticado();
    return usuario;
  }

  @Post('trocar-senha')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Troca a senha e encerra todas as sessões do usuário' })
  async trocar(@Body() dto: TrocarSenhaDto, @UsuarioAtual() atual: UsuarioAutenticado): Promise<void> {
    await this.trocarSenha.executar({ usuarioId: atual.id, ...dto });
  }

  @Post('recuperar-senha')
  @RotaPublica()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Solicita o e-mail de redefinição (resposta igual para qualquer e-mail)' })
  async recuperar(@Body() dto: RecuperarSenhaDto): Promise<void> {
    await this.solicitarRecuperacao.executar(dto.email);
  }

  @Post('redefinir-senha')
  @RotaPublica()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Define nova senha usando o token recebido por e-mail' })
  async redefinir(@Body() dto: RedefinirSenhaDto): Promise<void> {
    await this.redefinirSenha.executar(dto);
  }
}
