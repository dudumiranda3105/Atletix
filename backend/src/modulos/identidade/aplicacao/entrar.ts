import { Inject, Injectable } from '@nestjs/common';
import { Bloqueado, NaoAutenticado } from '../../../compartilhado/dominio/erros';
import { PUBLICADOR_DE_EVENTOS, PublicadorDeEventos } from '../../../compartilhado/eventos/evento-de-dominio';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios } from '../../usuarios/contratos';
import { ContaBloqueada, LoginFalhou, LoginRealizado } from '../contratos/eventos';
import {
  HASH_DE_SENHA,
  HashDeSenha,
  REPOSITORIO_DE_CREDENCIAIS,
  RepositorioDeCredenciais,
} from '../dominio/portas';
import { ServicoDeSessoes, TokensEmitidos } from './servico-de-sessoes';

@Injectable()
export class Entrar {
  private hashFicticio?: Promise<string>;

  constructor(
    @Inject(DIRETORIO_DE_USUARIOS) private readonly usuarios: DiretorioDeUsuarios,
    @Inject(REPOSITORIO_DE_CREDENCIAIS) private readonly credenciais: RepositorioDeCredenciais,
    @Inject(HASH_DE_SENHA) private readonly hash: HashDeSenha,
    @Inject(PUBLICADOR_DE_EVENTOS) private readonly eventos: PublicadorDeEventos,
    @Inject(RELOGIO) private readonly relogio: Relogio,
    private readonly sessoes: ServicoDeSessoes,
  ) {}

  /**
   * A ordem dos passos é intencional: bloqueio → senha → status da conta → sessão.
   * Nenhuma sessão é aberta antes de a senha ser conferida.
   */
  async executar(dados: { email: string; senha: string }): Promise<TokensEmitidos> {
    const agora = this.relogio.agora();
    const usuario = await this.usuarios.buscarPorEmail(dados.email);
    const credencial = usuario ? await this.credenciais.buscarPorUsuario(usuario.id) : null;

    if (!usuario || !credencial) {
      // Gasta o mesmo tempo de uma conferência real, para não revelar quais e-mails existem.
      await this.hash.conferir(dados.senha, await this.obterHashFicticio());
      this.eventos.publicar(new LoginFalhou(dados.email, null, agora));
      throw this.credenciaisInvalidas();
    }

    if (credencial.estaBloqueada(agora)) {
      throw new Bloqueado(
        'CONTA_BLOQUEADA',
        'Conta bloqueada temporariamente por excesso de tentativas. Tente mais tarde ou redefina a senha.',
      );
    }

    if (!(await this.hash.conferir(dados.senha, credencial.hashDaSenha))) {
      const bloqueou = credencial.registrarFalha(agora);
      await this.credenciais.salvar(credencial);
      this.eventos.publicar(new LoginFalhou(usuario.email, usuario.id, agora));
      if (bloqueou && credencial.bloqueadaAte) {
        this.eventos.publicar(
          new ContaBloqueada(usuario.id, usuario.nome, usuario.email, credencial.bloqueadaAte, agora),
        );
      }
      throw this.credenciaisInvalidas();
    }

    if (!usuario.ativo) {
      throw new NaoAutenticado('CONTA_DESATIVADA', 'Esta conta está desativada. Procure a recepção.');
    }

    credencial.registrarSucesso();
    await this.credenciais.salvar(credencial);
    const tokens = await this.sessoes.abrir(usuario.id);
    this.eventos.publicar(new LoginRealizado(usuario.id, agora));
    return tokens;
  }

  private credenciaisInvalidas(): NaoAutenticado {
    return new NaoAutenticado('CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.');
  }

  private obterHashFicticio(): Promise<string> {
    this.hashFicticio ??= this.hash.gerar('senha-que-ninguem-usa');
    return this.hashFicticio;
  }
}
