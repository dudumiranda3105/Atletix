import { Body, Controller, Get, Inject, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequerPermissao, UsuarioAtual } from '../../../compartilhado/seguranca/decoradores';
import { UsuarioAutenticado } from '../../../compartilhado/seguranca/portas';
import { AlterarStatusDoUsuario } from '../aplicacao/alterar-status-do-usuario';
import { paraResumo } from '../aplicacao/diretorio-de-usuarios-local';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios, UsuarioResumo } from '../contratos/diretorio-de-usuarios';
import { PermissoesDeUsuarios } from '../contratos/permissoes';
import { AlterarStatusDto } from './dto';

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(
    @Inject(DIRETORIO_DE_USUARIOS) private readonly diretorio: DiretorioDeUsuarios,
    private readonly alterarStatus: AlterarStatusDoUsuario,
  ) {}

  @Get()
  @RequerPermissao(PermissoesDeUsuarios.LISTAR)
  @ApiOperation({ summary: 'Lista os usuários cadastrados' })
  listar(): Promise<UsuarioResumo[]> {
    return this.diretorio.listar();
  }

  @Patch(':id/status')
  @RequerPermissao(PermissoesDeUsuarios.ALTERAR_STATUS)
  @ApiOperation({ summary: 'Ativa ou desativa uma conta (desativar encerra as sessões)' })
  async definirStatus(
    @Param('id') id: string,
    @Body() dto: AlterarStatusDto,
    @UsuarioAtual() solicitante: UsuarioAutenticado,
  ): Promise<UsuarioResumo> {
    const usuario = await this.alterarStatus.executar({
      usuarioId: id,
      ativo: dto.ativo,
      solicitanteId: solicitante.id,
    });
    return paraResumo(usuario);
  }
}
