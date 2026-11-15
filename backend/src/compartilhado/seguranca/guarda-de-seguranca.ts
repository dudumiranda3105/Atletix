import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AcessoNegado, NaoAutenticado } from '../dominio/erros';
import { CHAVE_PERMISSAO, CHAVE_ROTA_PUBLICA } from './decoradores';
import { AUTENTICADOR, AUTORIZADOR, Autenticador, Autorizador } from './portas';

/**
 * Guarda global: toda rota passa por aqui.
 *
 * A ordem "autenticar e só depois autorizar" é obrigatória (conascência de execução). Ela fica
 * encapsulada neste único método, em vez de depender da ordem de registro de dois guardas.
 */
@Injectable()
export class GuardaDeSeguranca implements CanActivate {
  constructor(
    private readonly refletor: Reflector,
    @Inject(AUTENTICADOR) private readonly autenticador: Autenticador,
    @Inject(AUTORIZADOR) private readonly autorizador: Autorizador,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const alvos = [contexto.getHandler(), contexto.getClass()];
    if (this.refletor.getAllAndOverride<boolean>(CHAVE_ROTA_PUBLICA, alvos)) return true;

    const requisicao = contexto.switchToHttp().getRequest();
    const token = this.extrairToken(requisicao.headers?.authorization);
    if (!token) throw new NaoAutenticado();

    const usuario = await this.autenticador.autenticar(token);
    requisicao.usuario = usuario;

    const permissao = this.refletor.getAllAndOverride<string>(CHAVE_PERMISSAO, alvos);
    if (permissao && !(await this.autorizador.possuiPermissao(usuario.id, permissao))) {
      throw new AcessoNegado();
    }
    return true;
  }

  private extrairToken(cabecalho?: string): string | null {
    const [esquema, token] = (cabecalho ?? '').split(' ');
    return esquema === 'Bearer' && token ? token : null;
  }
}
