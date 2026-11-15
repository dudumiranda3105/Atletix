import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PapelAlterado } from '../../autorizacao/contratos';
import { CheckinNegado, CheckinRegistrado } from '../../checkin/contratos';
import {
  ContaBloqueada,
  LoginFalhou,
  LoginRealizado,
  RecuperacaoDeSenhaSolicitada,
  SenhaAlterada,
  SenhaRedefinida,
  SessaoEncerrada,
} from '../../identidade/contratos';
import { MatriculaRegistrada } from '../../matriculas/contratos';
import { UsuarioCadastrado, UsuarioDesativado, UsuarioReativado } from '../../usuarios/contratos';
import { ServicoDeAuditoria } from '../aplicacao/servico-de-auditoria';

/**
 * Assina os eventos dos outros módulos e grava a trilha de auditoria.
 *
 * Nenhum módulo chama a Auditoria: para auditar um fato novo, basta assinar o evento aqui.
 * Cada registro guarda só o que está descrito abaixo; dados sensíveis dos eventos (como o
 * token de recuperação de senha) nunca são gravados.
 */
@Injectable()
export class OuvinteDeEventos {
  constructor(private readonly auditoria: ServicoDeAuditoria) {}

  @OnEvent(UsuarioCadastrado.NOME)
  aoCadastrarUsuario(e: UsuarioCadastrado) {
    return this.registrar(e.nome, e.usuarioId, `Conta criada para ${e.email}.`, e.ocorridoEm);
  }

  @OnEvent(UsuarioDesativado.NOME)
  aoDesativarUsuario(e: UsuarioDesativado) {
    return this.registrar(e.nome, e.usuarioId, `Conta desativada pelo usuário ${e.alteradoPor}.`, e.ocorridoEm);
  }

  @OnEvent(UsuarioReativado.NOME)
  aoReativarUsuario(e: UsuarioReativado) {
    return this.registrar(e.nome, e.usuarioId, `Conta reativada pelo usuário ${e.alteradoPor}.`, e.ocorridoEm);
  }

  @OnEvent(LoginRealizado.NOME)
  aoEntrar(e: LoginRealizado) {
    return this.registrar(e.nome, e.usuarioId, 'Login realizado.', e.ocorridoEm);
  }

  @OnEvent(LoginFalhou.NOME)
  aoFalharLogin(e: LoginFalhou) {
    return this.registrar(e.nome, e.usuarioId, `Tentativa de login sem sucesso para ${e.email}.`, e.ocorridoEm);
  }

  @OnEvent(ContaBloqueada.NOME)
  aoBloquearConta(e: ContaBloqueada) {
    return this.registrar(e.nome, e.usuarioId, 'Conta bloqueada por excesso de tentativas.', e.ocorridoEm);
  }

  @OnEvent(SessaoEncerrada.NOME)
  aoSair(e: SessaoEncerrada) {
    return this.registrar(e.nome, e.usuarioId, 'Logout realizado.', e.ocorridoEm);
  }

  @OnEvent(SenhaAlterada.NOME)
  aoAlterarSenha(e: SenhaAlterada) {
    return this.registrar(e.nome, e.usuarioId, 'Senha alterada; sessões encerradas.', e.ocorridoEm);
  }

  @OnEvent(RecuperacaoDeSenhaSolicitada.NOME)
  aoSolicitarRecuperacao(e: RecuperacaoDeSenhaSolicitada) {
    return this.registrar(e.nome, e.usuarioId, 'Recuperação de senha solicitada.', e.ocorridoEm);
  }

  @OnEvent(SenhaRedefinida.NOME)
  aoRedefinirSenha(e: SenhaRedefinida) {
    return this.registrar(e.nome, e.usuarioId, 'Senha redefinida por link de recuperação.', e.ocorridoEm);
  }

  @OnEvent(PapelAlterado.NOME)
  aoAlterarPapel(e: PapelAlterado) {
    return this.registrar(
      e.nome,
      e.usuarioId,
      `Papel alterado de ${e.papelAnterior} para ${e.papelNovo} pelo usuário ${e.alteradoPor}.`,
      e.ocorridoEm,
    );
  }

  @OnEvent(MatriculaRegistrada.NOME)
  aoRegistrarMatricula(e: MatriculaRegistrada) {
    return this.registrar(
      e.nome,
      e.alunoId,
      `Matrícula ${e.plano} registrada pelo usuário ${e.registradaPor}.`,
      e.ocorridoEm,
    );
  }

  @OnEvent(CheckinRegistrado.NOME)
  aoRegistrarCheckin(e: CheckinRegistrado) {
    return this.registrar(e.nome, e.alunoId, 'Check-in registrado.', e.ocorridoEm);
  }

  @OnEvent(CheckinNegado.NOME)
  aoNegarCheckin(e: CheckinNegado) {
    return this.registrar(e.nome, e.alunoId, `Check-in negado (${e.motivo}).`, e.ocorridoEm);
  }

  private registrar(tipo: string, usuarioId: string | null, descricao: string, ocorridoEm: Date) {
    return this.auditoria.registrar({ tipo, usuarioId, descricao, ocorridoEm });
  }
}
