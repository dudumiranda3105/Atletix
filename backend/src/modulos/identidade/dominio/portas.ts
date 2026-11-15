import { Credencial } from './credencial';
import { Sessao } from './sessao';
import { TokenDeRecuperacao } from './token-de-recuperacao';

/**
 * Portas do módulo Identidade: o que o domínio precisa do mundo externo.
 * As implementações (TypeORM, bcrypt, JWT) ficam em infraestrutura/ e podem ser trocadas
 * sem tocar nos casos de uso.
 */
export const REPOSITORIO_DE_CREDENCIAIS = Symbol('REPOSITORIO_DE_CREDENCIAIS');
export interface RepositorioDeCredenciais {
  salvar(credencial: Credencial): Promise<void>;
  buscarPorUsuario(usuarioId: string): Promise<Credencial | null>;
}

export const REPOSITORIO_DE_SESSOES = Symbol('REPOSITORIO_DE_SESSOES');
export interface RepositorioDeSessoes {
  salvar(sessao: Sessao): Promise<void>;
  buscarPorHash(hashDoToken: string): Promise<Sessao | null>;
  revogarTodasDoUsuario(usuarioId: string, agora: Date): Promise<void>;
}

export const REPOSITORIO_DE_TOKENS_DE_RECUPERACAO = Symbol('REPOSITORIO_DE_TOKENS_DE_RECUPERACAO');
export interface RepositorioDeTokensDeRecuperacao {
  salvar(token: TokenDeRecuperacao): Promise<void>;
  buscarPorHash(hashDoToken: string): Promise<TokenDeRecuperacao | null>;
}

export const HASH_DE_SENHA = Symbol('HASH_DE_SENHA');
export interface HashDeSenha {
  gerar(senha: string): Promise<string>;
  conferir(senha: string, hash: string): Promise<boolean>;
}

export const EMISSOR_DE_TOKEN_DE_ACESSO = Symbol('EMISSOR_DE_TOKEN_DE_ACESSO');
export interface EmissorDeTokenDeAcesso {
  emitir(usuarioId: string): Promise<{ token: string; expiraEmSegundos: number }>;
  /** Devolve o id do usuário, ou null se o token for inválido ou estiver expirado. */
  verificar(token: string): Promise<string | null>;
}

export const GERADOR_DE_TOKEN_OPACO = Symbol('GERADOR_DE_TOKEN_OPACO');
export interface GeradorDeTokenOpaco {
  gerar(): { token: string; hash: string };
  resumir(token: string): string;
}
