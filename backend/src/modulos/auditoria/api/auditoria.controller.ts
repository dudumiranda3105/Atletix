import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequerPermissao } from '../../../compartilhado/seguranca/decoradores';
import { ServicoDeAuditoria } from '../aplicacao/servico-de-auditoria';
import { PermissoesDeAuditoria } from '../contratos/permissoes';

@ApiTags('Auditoria')
@ApiBearerAuth()
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoria: ServicoDeAuditoria) {}

  @Get('registros')
  @RequerPermissao(PermissoesDeAuditoria.CONSULTAR)
  @ApiOperation({ summary: 'Trilha de auditoria, do registro mais recente para o mais antigo' })
  @ApiQuery({ name: 'limite', required: false })
  async listar(@Query('limite', new DefaultValuePipe(100), ParseIntPipe) limite: number) {
    const registros = await this.auditoria.listarRecentes(limite);
    return registros.map((r) => ({
      id: r.id,
      tipo: r.tipo,
      usuarioId: r.usuarioId,
      descricao: r.descricao,
      ocorridoEm: r.ocorridoEm,
    }));
  }
}
