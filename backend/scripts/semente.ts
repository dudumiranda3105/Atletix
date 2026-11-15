/**
 * Cria os dados de demonstração: um usuário por papel e uma matrícula ativa.
 * Pode ser executado várias vezes; contas que já existem são mantidas.
 *
 * Uso: npm run semente
 *
 * Este script faz parte da raiz de composição (como o main.ts), por isso pode acionar
 * casos de uso de módulos diferentes. A senha vem de SEMENTE_SENHA (veja .env.example).
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AlterarPapel } from '../src/modulos/autorizacao/aplicacao/alterar-papel';
import { Papel } from '../src/modulos/autorizacao/contratos';
import { CadastrarConta } from '../src/modulos/identidade/aplicacao/cadastrar-conta';
import { RegistrarMatricula } from '../src/modulos/matriculas/aplicacao/registrar-matricula';
import { CONSULTA_DE_MATRICULAS, ConsultaDeMatriculas } from '../src/modulos/matriculas/contratos';
import { Plano } from '../src/modulos/matriculas/dominio/matricula';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios } from '../src/modulos/usuarios/contratos';

const SENHA_PADRAO = 'Atletix@2026';

const CONTAS: { nome: string; email: string; papel: Papel; plano?: Plano }[] = [
  { nome: 'Ana Administradora', email: 'admin@atletix.dev', papel: Papel.ADMIN },
  { nome: 'Rafael Recepção', email: 'recepcao@atletix.dev', papel: Papel.RECEPCAO },
  { nome: 'Igor Instrutor', email: 'instrutor@atletix.dev', papel: Papel.INSTRUTOR },
  { nome: 'Alice Aluna', email: 'aluna@atletix.dev', papel: Papel.ALUNO, plano: Plano.MENSAL },
  { nome: 'Vitor Sem Matrícula', email: 'aluno.sem.matricula@atletix.dev', papel: Papel.ALUNO },
];

async function semear(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const usuarios = app.get<DiretorioDeUsuarios>(DIRETORIO_DE_USUARIOS, { strict: false });
  const matriculas = app.get<ConsultaDeMatriculas>(CONSULTA_DE_MATRICULAS, { strict: false });
  const cadastrarConta = app.get(CadastrarConta, { strict: false });
  const alterarPapel = app.get(AlterarPapel, { strict: false });
  const registrarMatricula = app.get(RegistrarMatricula, { strict: false });
  const senha = process.env.SEMENTE_SENHA ?? SENHA_PADRAO;

  for (const conta of CONTAS) {
    const existente = await usuarios.buscarPorEmail(conta.email);
    const usuario = existente ?? (await cadastrarConta.executar({ nome: conta.nome, email: conta.email, senha }));
    await alterarPapel.executar({ usuarioId: usuario.id, papel: conta.papel, alteradoPor: 'semente' });
    if (conta.plano && !(await matriculas.situacaoDoAluno(usuario.id)).ativa) {
      await registrarMatricula.executar({ alunoId: usuario.id, plano: conta.plano, registradaPor: 'semente' });
    }
    console.log(`${existente ? 'já existia' : 'criada   '}  ${conta.papel.padEnd(9)}  ${conta.email}`);
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
