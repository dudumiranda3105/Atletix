/**
 * Portas de segurança. O guarda global depende destas abstrações; o módulo Identidade implementa
 * o Autenticador e o módulo Autorização implementa o Autorizador (inversão de dependência).
 */
export interface UsuarioAutenticado {
  readonly id: string;
}

export const AUTENTICADOR = Symbol('AUTENTICADOR');

export interface Autenticador {
  /** Valida o token de acesso e devolve o usuário. Lança NaoAutenticado se o token não vale. */
  autenticar(tokenDeAcesso: string): Promise<UsuarioAutenticado>;
}

export const AUTORIZADOR = Symbol('AUTORIZADOR');

export interface Autorizador {
  possuiPermissao(usuarioId: string, permissao: string): Promise<boolean>;
}
