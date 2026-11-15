/**
 * Contrato público do módulo Usuários.
 * Outros módulos enxergam apenas este resumo; a entidade e as tabelas ficam privadas.
 */
export interface UsuarioResumo {
  readonly id: string;
  readonly nome: string;
  readonly email: string;
  readonly ativo: boolean;
}

export const DIRETORIO_DE_USUARIOS = Symbol('DIRETORIO_DE_USUARIOS');

export interface DiretorioDeUsuarios {
  buscarPorId(id: string): Promise<UsuarioResumo | null>;
  buscarPorEmail(email: string): Promise<UsuarioResumo | null>;
  listar(): Promise<UsuarioResumo[]>;
  /** Lança Conflito (EMAIL_JA_CADASTRADO) se o e-mail já estiver em uso. */
  cadastrar(dados: { nome: string; email: string }): Promise<UsuarioResumo>;
}
