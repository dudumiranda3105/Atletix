import { Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequerPermissao, UsuarioAtual } from '../../../compartilhado/seguranca/decoradores';
import { UsuarioAutenticado } from '../../../compartilhado/seguranca/portas';
import { CheckinDoDia, ConsultarCheckins } from '../aplicacao/consultar-checkins';
import { RegistrarCheckin } from '../aplicacao/registrar-checkin';
import { PermissoesDeCheckin } from '../contratos/permissoes';

@ApiTags('Check-in')
@ApiBearerAuth()
@Controller('checkins')
export class CheckinController {
  constructor(
    private readonly registrarCheckin: RegistrarCheckin,
    private readonly consultarCheckins: ConsultarCheckins,
  ) {}

  @Post()
  @RequerPermissao(PermissoesDeCheckin.REGISTRAR_PROPRIO)
  @ApiOperation({ summary: 'Check-in do aluno autenticado (exige conta e matrícula ativas)' })
  async registrar(@UsuarioAtual() atual: UsuarioAutenticado) {
    const checkin = await this.registrarCheckin.executar(atual.id);
    return { id: checkin.id, registradoEm: checkin.registradoEm };
  }

  @Get('meus')
  @RequerPermissao(PermissoesDeCheckin.LISTAR_PROPRIOS)
  @ApiOperation({ summary: 'Últimos check-ins do aluno autenticado' })
  async meus(@UsuarioAtual() atual: UsuarioAutenticado) {
    const checkins = await this.consultarCheckins.doAluno(atual.id);
    return checkins.map((c) => ({ id: c.id, registradoEm: c.registradoEm }));
  }

  @Get('hoje')
  @RequerPermissao(PermissoesDeCheckin.LISTAR_DO_DIA)
  @ApiOperation({ summary: 'Check-ins de hoje, para a recepção' })
  hoje(): Promise<CheckinDoDia[]> {
    return this.consultarCheckins.doDia();
  }
}
