import { Inject, Injectable } from '@nestjs/common';
import { NaoAutenticado } from '../../../compartilhado/dominio/erros';
import { Autenticador, UsuarioAutenticado } from '../../../compartilhado/seguranca/portas';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios } from '../../usuarios/contratos';
import { EMISSOR_DE_TOKEN_DE_ACESSO, EmissorDeTokenDeAcesso } from '../dominio/portas';

/**
 * Implementa a porta Autenticador usada pelo guarda global.
 *
 * O token de acesso carrega apenas o id do usuário. O status da conta é conferido a cada
 * requisição, então uma conta desativada perde o acesso imediatamente, sem esperar o token expirar.
 */
@Injectable()
export class AutenticadorPorToken implements Autenticador {
  constructor(
    @Inject(EMISSOR_DE_TOKEN_DE_ACESSO) private readonly emissor: EmissorDeTokenDeAcesso,
    @Inject(DIRETORIO_DE_USUARIOS) private readonly usuarios: DiretorioDeUsuarios,
  ) {}

  async autenticar(tokenDeAcesso: string): Promise<UsuarioAutenticado> {
    const usuarioId = await this.emissor.verificar(tokenDeAcesso);
    if (!usuarioId) throw new NaoAutenticado('TOKEN_INVALIDO', 'Sessão inválida ou expirada.');

    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario?.ativo) throw new NaoAutenticado('CONTA_DESATIVADA', 'Esta conta está desativada.');
    return { id: usuario.id };
  }
}
