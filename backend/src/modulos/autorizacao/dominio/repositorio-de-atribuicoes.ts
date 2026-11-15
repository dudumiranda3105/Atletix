import { Papel } from '../contratos/papel';

/** Papel atribuído a um usuário. Usuários sem atribuição usam o PAPEL_PADRAO. */
export interface Atribuicao {
  readonly usuarioId: string;
  readonly papel: Papel;
}

export const REPOSITORIO_DE_ATRIBUICOES = Symbol('REPOSITORIO_DE_ATRIBUICOES');

export interface RepositorioDeAtribuicoes {
  salvar(atribuicao: Atribuicao, agora: Date): Promise<void>;
  buscarPorUsuario(usuarioId: string): Promise<Atribuicao | null>;
  listar(): Promise<Atribuicao[]>;
}
