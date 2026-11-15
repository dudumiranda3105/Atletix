import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { RequerPermissao, UsuarioAtual } from '../../../compartilhado/seguranca/decoradores';
import { UsuarioAutenticado } from '../../../compartilhado/seguranca/portas';
import { RegistrarMatricula } from '../aplicacao/registrar-matricula';
import {
  CONSULTA_DE_MATRICULAS,
  ConsultaDeMatriculas,
  SituacaoDaMatricula,
} from '../contratos/consulta-de-matriculas';
import { PermissoesDeMatriculas } from '../contratos/permissoes';
import { Plano } from '../dominio/matricula';

export class RegistrarMatriculaDto {
  @ApiProperty({ description: 'Id do usuário (aluno)' })
  @IsUUID()
  alunoId: string;

  @ApiProperty({ enum: Plano })
  @IsEnum(Plano)
  plano: Plano;
}

@ApiTags('Matrículas')
@ApiBearerAuth()
@Controller('matriculas')
export class MatriculasController {
  constructor(
    private readonly registrarMatricula: RegistrarMatricula,
    @Inject(CONSULTA_DE_MATRICULAS) private readonly consulta: ConsultaDeMatriculas,
  ) {}

  @Post()
  @RequerPermissao(PermissoesDeMatriculas.REGISTRAR)
  @ApiOperation({ summary: 'Registra ou renova a matrícula de um aluno' })
  async registrar(@Body() dto: RegistrarMatriculaDto, @UsuarioAtual() atual: UsuarioAutenticado) {
    const matricula = await this.registrarMatricula.executar({ ...dto, registradaPor: atual.id });
    return {
      id: matricula.id,
      alunoId: matricula.alunoId,
      plano: matricula.plano,
      inicioEm: matricula.inicioEm,
      validaAte: matricula.validaAte,
    };
  }

  @Get('minha')
  @RequerPermissao(PermissoesDeMatriculas.CONSULTAR_PROPRIA)
  @ApiOperation({ summary: 'Situação da matrícula do aluno autenticado' })
  minha(@UsuarioAtual() atual: UsuarioAutenticado): Promise<SituacaoDaMatricula> {
    return this.consulta.situacaoDoAluno(atual.id);
  }

  @Get('aluno/:alunoId')
  @RequerPermissao(PermissoesDeMatriculas.CONSULTAR)
  @ApiOperation({ summary: 'Situação da matrícula de um aluno' })
  doAluno(@Param('alunoId') alunoId: string): Promise<SituacaoDaMatricula> {
    return this.consulta.situacaoDoAluno(alunoId);
  }
}
