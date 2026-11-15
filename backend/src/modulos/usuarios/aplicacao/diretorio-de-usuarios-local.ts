import { Inject, Injectable } from '@nestjs/common';
import { DiretorioDeUsuarios, UsuarioResumo } from '../contratos/diretorio-de-usuarios';
import { REPOSITORIO_DE_USUARIOS, RepositorioDeUsuarios } from '../dominio/repositorio-de-usuarios';
import { Usuario } from '../dominio/usuario';
import { CadastrarUsuario } from './cadastrar-usuario';

/**
 * Implementação em processo do contrato DiretorioDeUsuarios.
 * Se Usuários virar um serviço separado, os outros módulos recebem um cliente HTTP no lugar desta classe.
 */
@Injectable()
export class DiretorioDeUsuariosLocal implements DiretorioDeUsuarios {
  constructor(
    @Inject(REPOSITORIO_DE_USUARIOS) private readonly usuarios: RepositorioDeUsuarios,
    private readonly cadastrarUsuario: CadastrarUsuario,
  ) {}

  async buscarPorId(id: string): Promise<UsuarioResumo | null> {
    const usuario = await this.usuarios.buscarPorId(id);
    return usuario ? paraResumo(usuario) : null;
  }

  async buscarPorEmail(email: string): Promise<UsuarioResumo | null> {
    const usuario = await this.usuarios.buscarPorEmail(Usuario.normalizarEmail(email));
    return usuario ? paraResumo(usuario) : null;
  }

  async listar(): Promise<UsuarioResumo[]> {
    return (await this.usuarios.listar()).map(paraResumo);
  }

  async cadastrar(dados: { nome: string; email: string }): Promise<UsuarioResumo> {
    return paraResumo(await this.cadastrarUsuario.executar(dados));
  }
}

export function paraResumo(usuario: Usuario): UsuarioResumo {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email, ativo: usuario.ativo };
}
