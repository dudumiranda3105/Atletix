import { RegraViolada } from '../../../compartilhado/dominio/erros';

export const TAMANHO_MINIMO_DA_SENHA = 8;

/** Regra única de força de senha, usada no cadastro, na troca e na redefinição. */
export function validarSenha(senha: string): void {
  const forte = senha.length >= TAMANHO_MINIMO_DA_SENHA && /[A-Za-z]/.test(senha) && /\d/.test(senha);
  if (!forte) {
    throw new RegraViolada(
      'SENHA_FRACA',
      `A senha deve ter pelo menos ${TAMANHO_MINIMO_DA_SENHA} caracteres, com letras e números.`,
    );
  }
}
