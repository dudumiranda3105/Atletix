/**
 * Testes de ponta a ponta: sobem a aplicação inteira com banco em memória e exercitam os
 * cenários de qualidade descritos na documentação (seção 1.5).
 */
process.env.BANCO_ARQUIVO = ':memory:';
process.env.BCRYPT_CUSTO = '4';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule, configurarAplicacao } from '../src/app.module';
import { AlterarPapel } from '../src/modulos/autorizacao/aplicacao/alterar-papel';
import { Papel } from '../src/modulos/autorizacao/contratos';

const SENHA = 'Senha@12345';

describe('Atletix (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  const ids: Record<string, string> = {};

  const cadastrar = async (chave: string, nome: string) => {
    const resposta = await http
      .post('/api/auth/cadastro')
      .send({ nome, email: `${chave}@teste.dev`, senha: SENHA })
      .expect(201);
    ids[chave] = resposta.body.id;
  };

  const entrar = async (chave: string, senha = SENHA) => {
    const resposta = await http.post('/api/auth/entrar').send({ email: `${chave}@teste.dev`, senha });
    return resposta;
  };

  const tokensDe = async (chave: string) => (await entrar(chave)).body as {
    tokenDeAcesso: string;
    tokenDeRenovacao: string;
  };

  const com = (token: string) => ({ Authorization: `Bearer ${token}` });

  /** Eventos são assíncronos: espera até a condição valer (ou falha depois de 2 s). */
  const aguardar = async <T>(buscar: () => Promise<T | undefined>): Promise<T> => {
    for (let tentativa = 0; tentativa < 40; tentativa++) {
      const valor = await buscar();
      if (valor !== undefined) return valor;
      await new Promise((resolver) => setTimeout(resolver, 50));
    }
    throw new Error('Condição não atingida a tempo.');
  };

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    configurarAplicacao(app);
    await app.init();
    http = request(app.getHttpServer());

    await cadastrar('admin', 'Ana Administradora');
    await cadastrar('recepcao', 'Rafael Recepção');
    await cadastrar('aluna', 'Alice Aluna');
    // O primeiro administrador é criado fora da API, como faz o script de semente.
    await app.get(AlterarPapel, { strict: false }).executar({
      usuarioId: ids.admin,
      papel: Papel.ADMIN,
      alteradoPor: 'teste',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('autenticação', () => {
    it('recusa rota protegida sem token (401) e com token inválido (401)', async () => {
      await http.get('/api/auth/eu').expect(401);
      await http.get('/api/auth/eu').set(com('token-falso')).expect(401);
    });

    it('recusa senha errada com a mesma resposta de e-mail inexistente', async () => {
      const senhaErrada = await entrar('aluna', 'Errada@123');
      const emailInexistente = await entrar('ninguem');

      expect(senhaErrada.status).toBe(401);
      expect(emailInexistente.status).toBe(401);
      expect(senhaErrada.body.codigo).toBe(emailInexistente.body.codigo);
    });

    it('entra e consulta a própria conta e o próprio acesso', async () => {
      const { tokenDeAcesso } = await tokensDe('aluna');

      const eu = await http.get('/api/auth/eu').set(com(tokenDeAcesso)).expect(200);
      const acesso = await http.get('/api/autorizacao/eu').set(com(tokenDeAcesso)).expect(200);

      expect(eu.body).toMatchObject({ nome: 'Alice Aluna', email: 'aluna@teste.dev', ativo: true });
      expect(acesso.body.papel).toBe('ALUNO');
      expect(acesso.body.permissoes).toContain('checkin:registrar-proprio');
    });

    it('rotaciona o token de renovação: o token usado deixa de valer', async () => {
      const { tokenDeRenovacao } = await tokensDe('aluna');

      const renovado = await http.post('/api/auth/renovar').send({ tokenDeRenovacao }).expect(200);
      expect(renovado.body.tokenDeRenovacao).not.toBe(tokenDeRenovacao);

      await http.post('/api/auth/renovar').send({ tokenDeRenovacao }).expect(401);
    });

    it('logout revoga a sessão', async () => {
      const { tokenDeRenovacao } = await tokensDe('aluna');

      await http.post('/api/auth/sair').send({ tokenDeRenovacao }).expect(204);

      await http.post('/api/auth/renovar').send({ tokenDeRenovacao }).expect(401);
    });

    it('recusa cadastro com senha fraca ou e-mail repetido', async () => {
      const fraca = await http
        .post('/api/auth/cadastro')
        .send({ nome: 'Nova Pessoa', email: 'nova@teste.dev', senha: 'curta' });
      const repetido = await http
        .post('/api/auth/cadastro')
        .send({ nome: 'Outra Alice', email: 'ALUNA@teste.dev', senha: SENHA });

      expect(fraca.status).toBe(422);
      expect(repetido.status).toBe(409);
    });
  });

  describe('autorização', () => {
    it('aluno recebe 403 nas rotas administrativas', async () => {
      const { tokenDeAcesso } = await tokensDe('aluna');

      await http.get('/api/usuarios').set(com(tokenDeAcesso)).expect(403);
      await http.get('/api/auditoria/registros').set(com(tokenDeAcesso)).expect(403);
      await http
        .put(`/api/autorizacao/usuarios/${ids.aluna}/papel`)
        .set(com(tokenDeAcesso))
        .send({ papel: 'ADMIN' })
        .expect(403);
    });

    it('troca de papel vale na requisição seguinte, com o mesmo token', async () => {
      const admin = await tokensDe('admin');
      const recepcao = await tokensDe('recepcao');
      await http.get('/api/usuarios').set(com(recepcao.tokenDeAcesso)).expect(403);

      await http
        .put(`/api/autorizacao/usuarios/${ids.recepcao}/papel`)
        .set(com(admin.tokenDeAcesso))
        .send({ papel: 'RECEPCAO' })
        .expect(200);

      await http.get('/api/usuarios').set(com(recepcao.tokenDeAcesso)).expect(200);
    });

    it('não deixa rebaixar o último administrador', async () => {
      const admin = await tokensDe('admin');

      const resposta = await http
        .put(`/api/autorizacao/usuarios/${ids.admin}/papel`)
        .set(com(admin.tokenDeAcesso))
        .send({ papel: 'ALUNO' });

      expect(resposta.status).toBe(422);
      expect(resposta.body.codigo).toBe('ULTIMO_ADMINISTRADOR');
    });
  });

  describe('matrícula e check-in', () => {
    it('nega o check-in sem matrícula, libera depois da matrícula e aceita só um por dia', async () => {
      const aluna = await tokensDe('aluna');
      const recepcao = await tokensDe('recepcao');

      const negado = await http.post('/api/checkins').set(com(aluna.tokenDeAcesso));
      expect(negado.status).toBe(422);
      expect(negado.body.codigo).toBe('MATRICULA_INATIVA');

      await http
        .post('/api/matriculas')
        .set(com(recepcao.tokenDeAcesso))
        .send({ alunoId: ids.aluna, plano: 'MENSAL' })
        .expect(201);
      const situacao = await http.get('/api/matriculas/minha').set(com(aluna.tokenDeAcesso)).expect(200);
      expect(situacao.body).toMatchObject({ ativa: true, plano: 'MENSAL' });

      await http.post('/api/checkins').set(com(aluna.tokenDeAcesso)).expect(201);
      await http.post('/api/checkins').set(com(aluna.tokenDeAcesso)).expect(409);

      const hoje = await http.get('/api/checkins/hoje').set(com(recepcao.tokenDeAcesso)).expect(200);
      expect(hoje.body).toHaveLength(1);
      expect(hoje.body[0].nomeDoAluno).toBe('Alice Aluna');
    });
  });

  describe('senha', () => {
    it('recupera a senha pelo link do e-mail, que só funciona uma vez', async () => {
      const admin = await tokensDe('admin');
      await cadastrar('esquecida', 'Elisa Esquecida');

      await http.post('/api/auth/recuperar-senha').send({ email: 'esquecida@teste.dev' }).expect(202);
      await http.post('/api/auth/recuperar-senha').send({ email: 'nao-existe@teste.dev' }).expect(202);

      const token = await aguardar(async () => {
        const caixa = await http.get('/api/notificacoes/mensagens').set(com(admin.tokenDeAcesso));
        const email = caixa.body.find((m: { destinatario: string }) => m.destinatario === 'esquecida@teste.dev');
        const achado = email?.corpo.match(/token=([\w%-]+)/);
        return achado ? decodeURIComponent(achado[1]) : undefined;
      });

      await http.post('/api/auth/redefinir-senha').send({ token, novaSenha: 'NovaSenha@2026' }).expect(204);
      await http.post('/api/auth/redefinir-senha').send({ token, novaSenha: 'OutraSenha@2026' }).expect(422);

      expect((await entrar('esquecida')).status).toBe(401);
      expect((await entrar('esquecida', 'NovaSenha@2026')).status).toBe(200);
    });

    it('trocar a senha encerra as sessões abertas', async () => {
      await cadastrar('troca', 'Tiago Troca');
      const { tokenDeAcesso, tokenDeRenovacao } = await tokensDe('troca');

      await http
        .post('/api/auth/trocar-senha')
        .set(com(tokenDeAcesso))
        .send({ senhaAtual: SENHA, novaSenha: 'Trocada@2026' })
        .expect(204);

      await http.post('/api/auth/renovar').send({ tokenDeRenovacao }).expect(401);
      expect((await entrar('troca', 'Trocada@2026')).status).toBe(200);
    });

    it('bloqueia a conta depois de cinco senhas erradas', async () => {
      await cadastrar('bloqueada', 'Bruna Bloqueada');

      for (let tentativa = 0; tentativa < 5; tentativa++) {
        expect((await entrar('bloqueada', 'Errada@123')).status).toBe(401);
      }

      const resposta = await entrar('bloqueada');
      expect(resposta.status).toBe(423);
      expect(resposta.body.codigo).toBe('CONTA_BLOQUEADA');
    });
  });

  describe('desativação de conta', () => {
    it('conta desativada perde o acesso na requisição seguinte e não renova a sessão', async () => {
      const admin = await tokensDe('admin');
      await cadastrar('desligado', 'Davi Desligado');
      const { tokenDeAcesso, tokenDeRenovacao } = await tokensDe('desligado');
      await http.get('/api/auth/eu').set(com(tokenDeAcesso)).expect(200);

      await http
        .patch(`/api/usuarios/${ids.desligado}/status`)
        .set(com(admin.tokenDeAcesso))
        .send({ ativo: false })
        .expect(200);

      await http.get('/api/auth/eu').set(com(tokenDeAcesso)).expect(401);
      await http.post('/api/auth/renovar').send({ tokenDeRenovacao }).expect(401);
      expect((await entrar('desligado')).status).toBe(401);
    });

    it('ninguém desativa a própria conta', async () => {
      const admin = await tokensDe('admin');

      const resposta = await http
        .patch(`/api/usuarios/${ids.admin}/status`)
        .set(com(admin.tokenDeAcesso))
        .send({ ativo: false });

      expect(resposta.status).toBe(422);
    });
  });

  describe('auditoria', () => {
    it('registra os eventos de segurança sem guardar dados sensíveis', async () => {
      const admin = await tokensDe('admin');

      const registros = await aguardar(async () => {
        const resposta = await http.get('/api/auditoria/registros?limite=500').set(com(admin.tokenDeAcesso));
        const tipos = new Set(resposta.body.map((r: { tipo: string }) => r.tipo));
        return tipos.has('usuarios.usuario-desativado') ? (resposta.body as { tipo: string }[]) : undefined;
      });
      const tipos = new Set(registros.map((r) => r.tipo));

      for (const esperado of [
        'identidade.login-realizado',
        'identidade.login-falhou',
        'identidade.conta-bloqueada',
        'identidade.senha-redefinida',
        'autorizacao.papel-alterado',
        'matriculas.matricula-registrada',
        'checkin.checkin-registrado',
        'checkin.checkin-negado',
      ]) {
        expect(tipos).toContain(esperado);
      }
      expect(JSON.stringify(registros)).not.toMatch(/token=/);
    });
  });
});
