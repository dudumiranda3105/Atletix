import { Usuario } from './usuario';

export const REPOSITORIO_DE_USUARIOS = Symbol('REPOSITORIO_DE_USUARIOS');

export interface RepositorioDeUsuarios {
  salvar(usuario: Usuario): Promise<void>;
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  listar(): Promise<Usuario[]>;
}
