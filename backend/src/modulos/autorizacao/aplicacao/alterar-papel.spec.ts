import { EventoDeDominio } from '../../../compartilhado/eventos/evento-de-dominio';
import { DiretorioDeUsuarios, UsuarioResumo } from '../../usuarios/contratos';
import { PapelAlterado } from '../contratos/eventos';
import { Papel } from '../contratos/papel';
import { papelPermite } from '../dominio/politica-de-acesso';
import { Atribuicao, RepositorioDeAtribuicoes } from '../dominio/repositorio-de-atribuicoes';
import { AlterarPapel } from './alterar-papel';

/**
 * O caso de uso é testado sem banco e sem o módulo Usuários real: as dependências são
 * dublês que implementam as mesmas interfaces (contrato e porta).
 */
function montar(usuarios: UsuarioResumo[], atribuicoes: Atribuicao[]) {
  const tabela = new Map(atribuicoes.map((a) => [a.usuarioId, a]));
  const repositorio: RepositorioDeAtribuicoes = {
    salvar: async (a) => void tabela.set(a.usuarioId, a),
    buscarPorUsuario: async (id) => tabela.get(id) ?? null,
    listar: async () => [...tabela.values()],
  };
  const diretorio = {
    buscarPorId: async (id: string) => usuarios.find((u) => u.id === id) ?? null,
  } as DiretorioDeUsuarios;
  const publicados: EventoDeDominio[] = [];
  const casoDeUso = new AlterarPapel(
    repositorio,
    diretorio,
    { publicar: (e) => void publicados.push(e) },
    { agora: () => new Date('2026-11-20T10:00:00Z') },
  );
  return { casoDeUso, tabela, publicados };
}

const usuario = (id: string, ativo = true): UsuarioResumo => ({ id, nome: id, email: `${id}@x.dev`, ativo });

describe('AlterarPapel', () => {
  it('promove um usuário e publica o evento PapelAlterado', async () => {
    const { casoDeUso, tabela, publicados } = montar([usuario('ana'), usuario('rafa')], [
      { usuarioId: 'ana', papel: Papel.ADMIN },
    ]);

    await casoDeUso.executar({ usuarioId: 'rafa', papel: Papel.RECEPCAO, alteradoPor: 'ana' });

    expect(tabela.get('rafa')?.papel).toBe(Papel.RECEPCAO);
    expect(publicados).toHaveLength(1);
    expect(publicados[0]).toBeInstanceOf(PapelAlterado);
    expect(publicados[0]).toMatchObject({ papelAnterior: Papel.ALUNO, papelNovo: Papel.RECEPCAO });
  });

  it('não deixa rebaixar o único administrador ativo', async () => {
    const { casoDeUso } = montar([usuario('ana'), usuario('bia', false)], [
      { usuarioId: 'ana', papel: Papel.ADMIN },
      { usuarioId: 'bia', papel: Papel.ADMIN }, // administradora desativada não conta
    ]);

    await expect(
      casoDeUso.executar({ usuarioId: 'ana', papel: Papel.ALUNO, alteradoPor: 'ana' }),
    ).rejects.toMatchObject({ codigo: 'ULTIMO_ADMINISTRADOR' });
  });

  it('permite rebaixar um administrador quando existe outro ativo', async () => {
    const { casoDeUso, tabela } = montar([usuario('ana'), usuario('bia')], [
      { usuarioId: 'ana', papel: Papel.ADMIN },
      { usuarioId: 'bia', papel: Papel.ADMIN },
    ]);

    await casoDeUso.executar({ usuarioId: 'ana', papel: Papel.INSTRUTOR, alteradoPor: 'bia' });

    expect(tabela.get('ana')?.papel).toBe(Papel.INSTRUTOR);
  });

  it('recusa usuário inexistente', async () => {
    const { casoDeUso } = montar([], []);

    await expect(
      casoDeUso.executar({ usuarioId: 'ninguem', papel: Papel.ADMIN, alteradoPor: 'ana' }),
    ).rejects.toMatchObject({ codigo: 'USUARIO_NAO_ENCONTRADO' });
  });
});

describe('Política de acesso', () => {
  it('aluno não gerencia usuários; administrador sim', () => {
    expect(papelPermite(Papel.ALUNO, 'usuarios:listar')).toBe(false);
    expect(papelPermite(Papel.ADMIN, 'usuarios:alterar-status')).toBe(true);
  });

  it('somente o aluno faz o próprio check-in', () => {
    expect(papelPermite(Papel.ALUNO, 'checkin:registrar-proprio')).toBe(true);
    expect(papelPermite(Papel.ADMIN, 'checkin:registrar-proprio')).toBe(false);
  });

  it('somente o administrador altera papéis e consulta a auditoria', () => {
    for (const papel of [Papel.RECEPCAO, Papel.INSTRUTOR, Papel.ALUNO]) {
      expect(papelPermite(papel, 'autorizacao:alterar-papel')).toBe(false);
      expect(papelPermite(papel, 'auditoria:consultar')).toBe(false);
    }
  });
});
