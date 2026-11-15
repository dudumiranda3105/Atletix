import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ErroDeDominio, TipoDeErro } from '../dominio/erros';

const STATUS_POR_TIPO: Record<TipoDeErro, number> = {
  REGRA_VIOLADA: HttpStatus.UNPROCESSABLE_ENTITY,
  NAO_ENCONTRADO: HttpStatus.NOT_FOUND,
  CONFLITO: HttpStatus.CONFLICT,
  NAO_AUTENTICADO: HttpStatus.UNAUTHORIZED,
  ACESSO_NEGADO: HttpStatus.FORBIDDEN,
  BLOQUEADO: HttpStatus.LOCKED,
};

/** Único ponto que traduz erros de domínio para HTTP. Resposta: { status, codigo, mensagem }. */
@Catch()
export class FiltroDeErros implements ExceptionFilter {
  private readonly registro = new Logger('Erros');

  catch(erro: unknown, host: ArgumentsHost): void {
    const resposta = host.switchToHttp().getResponse();

    if (erro instanceof ErroDeDominio) {
      const status = STATUS_POR_TIPO[erro.tipo];
      resposta.status(status).json({ status, codigo: erro.codigo, mensagem: erro.message });
      return;
    }

    if (erro instanceof HttpException) {
      const status = erro.getStatus();
      const corpo = erro.getResponse();
      const detalhe = typeof corpo === 'string' ? corpo : (corpo as { message?: string | string[] }).message;
      const mensagem = Array.isArray(detalhe) ? detalhe.join(' ') : (detalhe ?? erro.message);
      const codigo = status === HttpStatus.BAD_REQUEST ? 'REQUISICAO_INVALIDA' : 'ERRO_HTTP';
      resposta.status(status).json({ status, codigo, mensagem });
      return;
    }

    this.registro.error(erro instanceof Error ? (erro.stack ?? erro.message) : String(erro));
    resposta
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ status: 500, codigo: 'ERRO_INTERNO', mensagem: 'Erro interno. Tente novamente.' });
  }
}
