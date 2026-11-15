import { Matricula, Plano } from './matricula';

const INICIO = new Date('2026-11-01T12:00:00Z');
const diasDepois = (dias: number) => new Date(INICIO.getTime() + dias * 24 * 60 * 60_000);

describe('Matricula', () => {
  it('calcula a validade a partir do plano', () => {
    expect(Matricula.nova('a1', Plano.MENSAL, INICIO, INICIO).validaAte).toEqual(diasDepois(30));
    expect(Matricula.nova('a1', Plano.TRIMESTRAL, INICIO, INICIO).validaAte).toEqual(diasDepois(90));
    expect(Matricula.nova('a1', Plano.ANUAL, INICIO, INICIO).validaAte).toEqual(diasDepois(365));
  });

  it('está ativa do início até o instante anterior ao vencimento', () => {
    const matricula = Matricula.nova('a1', Plano.MENSAL, INICIO, INICIO);

    expect(matricula.estaAtiva(diasDepois(-1))).toBe(false);
    expect(matricula.estaAtiva(INICIO)).toBe(true);
    expect(matricula.estaAtiva(diasDepois(29))).toBe(true);
    expect(matricula.estaAtiva(diasDepois(30))).toBe(false);
  });
});
