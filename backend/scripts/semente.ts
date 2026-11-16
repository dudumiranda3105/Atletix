/**
 * Cria os dados de demonstração: um usuário por papel, alguns alunos com matrícula ativa
 * e seis semanas de histórico de treinos, para o painel e os gráficos não aparecerem vazios.
 * Pode ser executado várias vezes; o que já existe é mantido.
 *
 * Uso: npm run semente
 *
 * Este script faz parte da raiz de composição (como o main.ts), por isso pode acionar casos de uso
 * e portas de módulos diferentes. O histórico é gravado direto nas portas porque os casos de uso
 * sempre registram "agora". A senha vem de SEMENTE_SENHA (veja .env.example).
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ServicoDeAuditoria } from '../src/modulos/auditoria/aplicacao/servico-de-auditoria';
import { AlterarPapel } from '../src/modulos/autorizacao/aplicacao/alterar-papel';
import { Papel } from '../src/modulos/autorizacao/contratos';
import { CheckinRegistrado } from '../src/modulos/checkin/contratos';
import { Checkin, REPOSITORIO_DE_CHECKINS, RepositorioDeCheckins } from '../src/modulos/checkin/dominio/checkin';
import { CadastrarConta } from '../src/modulos/identidade/aplicacao/cadastrar-conta';
import { LoginRealizado } from '../src/modulos/identidade/contratos';
import { CONSULTA_DE_MATRICULAS, ConsultaDeMatriculas, MatriculaRegistrada } from '../src/modulos/matriculas/contratos';
import {
  Matricula,
  Plano,
  REPOSITORIO_DE_MATRICULAS,
  RepositorioDeMatriculas,
} from '../src/modulos/matriculas/dominio/matricula';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios } from '../src/modulos/usuarios/contratos';

const SENHA_PADRAO = 'Atletix@2026';
const DIAS_DE_HISTORICO = 42;
const DIAS_DESDE_A_MATRICULA = 45;
const HORARIOS_DE_PICO = [6, 7, 7, 8, 12, 18, 18, 19, 19, 20];

interface Conta {
  nome: string;
  email: string;
  papel: Papel;
  /** Chance de treinar em um dia útil (0 a 1). Só para alunos com matrícula. */
  assiduidade?: number;
}

const CONTAS: Conta[] = [
  { nome: 'Ana Administradora', email: 'admin@atletix.dev', papel: Papel.ADMIN },
  { nome: 'Rafael Recepção', email: 'recepcao@atletix.dev', papel: Papel.RECEPCAO },
  { nome: 'Igor Instrutor', email: 'instrutor@atletix.dev', papel: Papel.INSTRUTOR },
  { nome: 'Alice Aluna', email: 'aluna@atletix.dev', papel: Papel.ALUNO, assiduidade: 0.75 },
  { nome: 'Bruno Barros', email: 'bruno.barros@atletix.dev', papel: Papel.ALUNO, assiduidade: 0.6 },
  { nome: 'Carla Couto', email: 'carla.couto@atletix.dev', papel: Papel.ALUNO, assiduidade: 0.5 },
  { nome: 'Diego Dantas', email: 'diego.dantas@atletix.dev', papel: Papel.ALUNO, assiduidade: 0.4 },
  { nome: 'Elisa Esteves', email: 'elisa.esteves@atletix.dev', papel: Papel.ALUNO, assiduidade: 0.65 },
  { nome: 'Fábio Freitas', email: 'fabio.freitas@atletix.dev', papel: Papel.ALUNO, assiduidade: 0.3 },
  { nome: 'Vitor Sem Matrícula', email: 'aluno.sem.matricula@atletix.dev', papel: Papel.ALUNO },
];

/** Gerador pseudoaleatório com semente fixa: a demonstração sai igual em toda execução. */
function criarSorteio(semente: number): () => number {
  let estado = semente;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function diasAtras(dias: number, hora = 0, minuto = 0): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - dias, hora, minuto);
}

async function semear(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const usuarios = app.get<DiretorioDeUsuarios>(DIRETORIO_DE_USUARIOS, { strict: false });
  const situacoes = app.get<ConsultaDeMatriculas>(CONSULTA_DE_MATRICULAS, { strict: false });
  const matriculas = app.get<RepositorioDeMatriculas>(REPOSITORIO_DE_MATRICULAS, { strict: false });
  const checkins = app.get<RepositorioDeCheckins>(REPOSITORIO_DE_CHECKINS, { strict: false });
  const auditoria = app.get(ServicoDeAuditoria, { strict: false });
  const cadastrarConta = app.get(CadastrarConta, { strict: false });
  const alterarPapel = app.get(AlterarPapel, { strict: false });
  const senha = process.env.SEMENTE_SENHA ?? SENHA_PADRAO;
  const sortear = criarSorteio(2026);

  for (const [indice, conta] of CONTAS.entries()) {
    const existente = await usuarios.buscarPorEmail(conta.email);
    const usuario = existente ?? (await cadastrarConta.executar({ nome: conta.nome, email: conta.email, senha }));
    await alterarPapel.executar({ usuarioId: usuario.id, papel: conta.papel, alteradoPor: 'semente' });
    console.log(`${existente ? 'já existia' : 'criada   '}  ${conta.papel.padEnd(9)}  ${conta.email}`);
    if (conta.assiduidade === undefined) continue;

    if (!(await situacoes.situacaoDoAluno(usuario.id)).ativa) {
      const inicio = diasAtras(DIAS_DESDE_A_MATRICULA, 9);
      const matricula = Matricula.nova(usuario.id, Plano.TRIMESTRAL, inicio, inicio);
      await matriculas.salvar(matricula);
      await auditoria.registrar({
        tipo: MatriculaRegistrada.NOME,
        usuarioId: usuario.id,
        descricao: `Matrícula ${matricula.plano} registrada pelo usuário semente.`,
        ocorridoEm: inicio,
      });
    }

    // O histórico só é criado uma vez: se já há entradas de dias anteriores, não repete.
    const anteriores = await checkins.listarNoIntervalo(diasAtras(DIAS_DE_HISTORICO + 1), diasAtras(0));
    if (anteriores.some((c) => c.alunoId === usuario.id)) continue;

    let treinos = 0;
    for (let dias = DIAS_DE_HISTORICO; dias >= 1; dias--) {
      const domingo = diasAtras(dias).getDay() === 0;
      // A primeira aluna treinou nos últimos quatro dias, para a sequência aparecer na demonstração.
      const sequenciaRecente = indice === 3 && dias <= 4;
      const treinou = sequenciaRecente || (!domingo && sortear() < conta.assiduidade);
      const hora = HORARIOS_DE_PICO[Math.floor(sortear() * HORARIOS_DE_PICO.length)];
      const minuto = Math.floor(sortear() * 60);
      if (!treinou) continue;

      const entrada = diasAtras(dias, hora, minuto);
      await checkins.salvar(Checkin.novo(usuario.id, entrada));
      await auditoria.registrar({
        tipo: LoginRealizado.NOME,
        usuarioId: usuario.id,
        descricao: 'Login realizado.',
        ocorridoEm: new Date(entrada.getTime() - 60_000),
      });
      await auditoria.registrar({
        tipo: CheckinRegistrado.NOME,
        usuarioId: usuario.id,
        descricao: 'Check-in registrado.',
        ocorridoEm: entrada,
      });
      treinos += 1;
    }
    console.log(`             ${String(treinos).padStart(2)} treinos em ${DIAS_DE_HISTORICO} dias`);
  }

  // Dá tempo para os assinantes de eventos (auditoria) terminarem antes de fechar o banco.
  await new Promise((resolver) => setTimeout(resolver, 200));
  await app.close();
  console.log('\nContas de demonstração prontas. A senha é o valor de SEMENTE_SENHA (veja .env.example).');
}

semear().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
