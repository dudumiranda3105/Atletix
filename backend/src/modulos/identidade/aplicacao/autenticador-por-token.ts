import { Inject, Injectable } from '@nestjs/common';
import { NaoAutenticado } from '../../../compartilhado/dominio/erros';
import { Autenticador, UsuarioAutenticado } from '../../../compartilhado/seguranca/portas';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios } from '../../usuarios/contratos';
import { EMISSOR_DE_TOKEN_DE_ACESSO, EmissorDeTokenDeAcesso } from '../dominio/portas';
import { ServicoDeSessoes } from './servico-de-sessoes';

/**
 * Implementa a porta Autenticador usada pelo guarda global.
 *
 * O token de acesso carrega apenas os ids do usuário e da sessão. A cada requisição são conferidos:
 *   1. a assinatura e a validade do token;
 *   2. se a sessão ainda vale (logout, troca de senha e desativação a revogam);
 *   3. se a conta continua ativa.
 * Assim, qualquer revogação tem efeito na requisição seguinte, sem esperar o token expirar.
 */
@Injectable()
export class AutenticadorPorToken implements Autenticador {
  constructor(
    @Inject(EMISSOR_DE_TOKEN_DE_ACESSO) private readonly emissor: EmissorDeTokenDeAcesso,
    @Inject(DIRETORIO_DE_USUARIOS) private readonly usuarios: DiretorioDeUsuarios,
    private readonly sessoes: ServicoDeSessoes,
  ) {}

  async autenticar(tokenDeAcesso: string): Promise<UsuarioAutenticado> {
    const conteudo = await this.emissor.verificar(tokenDeAcesso);
    if (!conteudo || !(await this.sessoes.estaAtiva(conteudo.sessaoId, conteudo.usuarioId))) {
      throw new NaoAutenticado('TOKEN_INVALIDO', 'Sessão inválida ou expirada.');
    }

    const usuario = await this.usuarios.buscarPorId(conteudo.usuarioId);
    if (!usuario?.ativo) throw new NaoAutenticado('CONTA_DESATIVADA', 'Esta conta está desativada.');
    return { id: usuario.id };
  }
}
