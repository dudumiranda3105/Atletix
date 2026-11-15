import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RequerPermissao, UsuarioAtual } from '../../../compartilhado/seguranca/decoradores';
import { UsuarioAutenticado } from '../../../compartilhado/seguranca/portas';
import { AlterarPapel } from '../aplicacao/alterar-papel';
import { ConsultarAcesso } from '../aplicacao/consultar-acesso';
import { Papel } from '../contratos/papel';
import { PermissoesDeAutorizacao } from '../contratos/permissoes';
import { Atribuicao } from '../dominio/repositorio-de-atribuicoes';

export class AlterarPapelDto {
  @ApiProperty({ enum: Papel })
  @IsEnum(Papel)
  papel: Papel;
}

@ApiTags('Autorização')
@ApiBearerAuth()
@Controller('autorizacao')
export class AutorizacaoController {
  constructor(
    private readonly consultarAcesso: ConsultarAcesso,
    private readonly alterarPapel: AlterarPapel,
  ) {}

  @Get('eu')
  @ApiOperation({ summary: 'Papel e permissões do usuário autenticado' })
  meuAcesso(@UsuarioAtual() atual: UsuarioAutenticado): Promise<{ papel: Papel; permissoes: string[] }> {
    return this.consultarAcesso.acessoDoUsuario(atual.id);
  }

  @Get('atribuicoes')
  @RequerPermissao(PermissoesDeAutorizacao.LISTAR_ATRIBUICOES)
  @ApiOperation({ summary: 'Papel de cada usuário cadastrado' })
  listar(): Promise<Atribuicao[]> {
    return this.consultarAcesso.listarAtribuicoes();
  }

  @Put('usuarios/:id/papel')
  @RequerPermissao(PermissoesDeAutorizacao.ALTERAR_PAPEL)
  @ApiOperation({ summary: 'Altera o papel de um usuário (nunca remove o último administrador)' })
  alterar(
    @Param('id') usuarioId: string,
    @Body() dto: AlterarPapelDto,
    @UsuarioAtual() atual: UsuarioAutenticado,
  ): Promise<Atribuicao> {
    return this.alterarPapel.executar({ usuarioId, papel: dto.papel, alteradoPor: atual.id });
  }
}
