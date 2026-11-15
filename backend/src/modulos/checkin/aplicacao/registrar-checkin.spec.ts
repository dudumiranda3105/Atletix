import { EventoDeDominio } from '../../../compartilhado/eventos/evento-de-dominio';
import { ConsultaDeMatriculas } from '../../matriculas/contratos';
import { DiretorioDeUsuarios } from '../../usuarios/contratos';
import { CheckinNegado, CheckinRegistrado } from '../contratos/eventos';
import { Checkin, RepositorioDeCheckins } from '../dominio/checkin';
import { RegistrarCheckin } from './registrar-checkin';

/**
 * O Check-in depende apenas dos CONTRATOS de Usuários e Matrículas. Por isso dá para testá-lo
 * trocando os dois módulos por dublês de poucas linhas, sem banco e sem autenticação real.
 */
function montar(cenario: { contaAtiva: boolean; matriculaAtiva: boolean }) {
  let agora = new Date(2026, 10, 20, 7, 30);
  const salvos: Checkin[] = [];
  const checkins: RepositorioDeCheckins = {
    salvar: async (c) => void salvos.push(c),
    existeNoIntervalo: async (alunoId, inicio, fim) =>
      salvos.some((c) => c.alunoId === alunoId && c.registradoEm >= inicio && c.registradoEm < fim),
    listarNoIntervalo: async () => salvos,
    listarDoAluno: async () => salvos,
  };
  const usuarios = {
    buscarPorId: async (id: string) => ({ id, nome: 'Alice', email: 'alice@x.dev', ativo: cenario.contaAtiva }),
  } as DiretorioDeUsuarios;
  const matriculas: ConsultaDeMatriculas = {
    situacaoDoAluno: async () => ({ ativa: cenario.matriculaAtiva, plano: 'MENSAL', validaAte: null }),
  };
  const publicados: EventoDeDominio[] = [];
  const casoDeUso = new RegistrarCheckin(
    checkins,
    usuarios,
    matriculas,
    { publicar: (e) => void publicados.push(e) },
    { agora: () => agora },
  );
  return { casoDeUso, salvos, publicados, avancarPara: (data: Date) => (agora = data) };
}

describe('RegistrarCheckin', () => {
  it('registra o check-in de quem tem conta e matrícula ativas', async () => {
    const { casoDeUso, salvos, publicados } = montar({ contaAtiva: true, matriculaAtiva: true });

    await casoDeUso.executar('alice');

    expect(salvos).toHaveLength(1);
    expect(publicados[0]).toBeInstanceOf(CheckinRegistrado);
  });

  it('nega o check-in sem matrícula ativa e publica o motivo', async () => {
    const { casoDeUso, salvos, publicados } = montar({ contaAtiva: true, matriculaAtiva: false });

    await expect(casoDeUso.executar('alice')).rejects.toMatchObject({ codigo: 'MATRICULA_INATIVA' });

    expect(salvos).toHaveLength(0);
    expect(publicados[0]).toBeInstanceOf(CheckinNegado);
  });

  it('nega o check-in de conta desativada', async () => {
    const { casoDeUso } = montar({ contaAtiva: false, matriculaAtiva: true });

    await expect(casoDeUso.executar('alice')).rejects.toMatchObject({ codigo: 'CONTA_INATIVA' });
  });

  it('aceita só um check-in por dia, e libera de novo no dia seguinte', async () => {
    const { casoDeUso, salvos, avancarPara } = montar({ contaAtiva: true, matriculaAtiva: true });
    await casoDeUso.executar('alice');

    avancarPara(new Date(2026, 10, 20, 19, 0));
    await expect(casoDeUso.executar('alice')).rejects.toMatchObject({ codigo: 'CHECKIN_JA_REGISTRADO' });

    avancarPara(new Date(2026, 10, 21, 6, 0));
    await casoDeUso.executar('alice');
    expect(salvos).toHaveLength(2);
  });
});
