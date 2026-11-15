import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { UsuarioAutenticado } from './portas';

export const CHAVE_ROTA_PUBLICA = 'seguranca:rota-publica';
export const CHAVE_PERMISSAO = 'seguranca:permissao';

/** Marca uma rota que não exige autenticação (ex.: login). Todas as outras exigem. */
export const RotaPublica = () => SetMetadata(CHAVE_ROTA_PUBLICA, true);

/**
 * Exige uma permissão. O nome da permissão é declarado no contrato do módulo dono da rota;
 * quais papéis a possuem é decidido somente pelo módulo Autorização.
 */
export const RequerPermissao = (permissao: string) => SetMetadata(CHAVE_PERMISSAO, permissao);

/** Injeta no controller o usuário autenticado pelo guarda de segurança. */
export const UsuarioAtual = createParamDecorator(
  (_dados: unknown, contexto: ExecutionContext): UsuarioAutenticado =>
    contexto.switchToHttp().getRequest().usuario,
);
