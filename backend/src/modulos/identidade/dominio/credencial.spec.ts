import { Credencial, MAXIMO_DE_TENTATIVAS, MINUTOS_DE_BLOQUEIO } from './credencial';

const AGORA = new Date('2026-11-20T10:00:00Z');
const minutosDepois = (minutos: number) => new Date(AGORA.getTime() + minutos * 60_000);

describe('Credencial', () => {
  it('bloqueia a conta na quinta senha errada seguida', () => {
    const credencial = Credencial.nova('u1', 'hash', AGORA);

    for (let i = 1; i < MAXIMO_DE_TENTATIVAS; i++) {
      expect(credencial.registrarFalha(AGORA)).toBe(false);
    }
    expect(credencial.estaBloqueada(AGORA)).toBe(false);

    expect(credencial.registrarFalha(AGORA)).toBe(true);
    expect(credencial.estaBloqueada(AGORA)).toBe(true);
  });

  it('libera a conta sozinha depois do tempo de bloqueio', () => {
    const credencial = Credencial.nova('u1', 'hash', AGORA);
    for (let i = 0; i < MAXIMO_DE_TENTATIVAS; i++) credencial.registrarFalha(AGORA);

    expect(credencial.estaBloqueada(minutosDepois(MINUTOS_DE_BLOQUEIO - 1))).toBe(true);
    expect(credencial.estaBloqueada(minutosDepois(MINUTOS_DE_BLOQUEIO))).toBe(false);
  });

  it('zera as tentativas depois de um login com sucesso', () => {
    const credencial = Credencial.nova('u1', 'hash', AGORA);
    credencial.registrarFalha(AGORA);
    credencial.registrarFalha(AGORA);

    credencial.registrarSucesso();

    expect(credencial.tentativasFalhas).toBe(0);
  });

  it('libera a conta quando a senha é redefinida', () => {
    const credencial = Credencial.nova('u1', 'hash', AGORA);
    for (let i = 0; i < MAXIMO_DE_TENTATIVAS; i++) credencial.registrarFalha(AGORA);

    credencial.definirSenha('novo-hash', AGORA);

    expect(credencial.estaBloqueada(AGORA)).toBe(false);
    expect(credencial.hashDaSenha).toBe('novo-hash');
  });
});
