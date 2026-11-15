import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Credencial } from '../dominio/credencial';
import {
  RepositorioDeCredenciais,
  RepositorioDeSessoes,
  RepositorioDeTokensDeRecuperacao,
} from '../dominio/portas';
import { Sessao } from '../dominio/sessao';
import { TokenDeRecuperacao } from '../dominio/token-de-recuperacao';
import { CredencialModelo, SessaoModelo, TokenDeRecuperacaoModelo } from './modelos';

@Injectable()
export class RepositorioDeCredenciaisTypeorm implements RepositorioDeCredenciais {
  constructor(@InjectRepository(CredencialModelo) private readonly tabela: Repository<CredencialModelo>) {}

  async salvar(credencial: Credencial): Promise<void> {
    await this.tabela.save({
      usuarioId: credencial.usuarioId,
      hashDaSenha: credencial.hashDaSenha,
      tentativasFalhas: credencial.tentativasFalhas,
      bloqueadaAte: credencial.bloqueadaAte,
      senhaAlteradaEm: credencial.senhaAlteradaEm,
    });
  }

  async buscarPorUsuario(usuarioId: string): Promise<Credencial | null> {
    const linha = await this.tabela.findOneBy({ usuarioId });
    if (!linha) return null;
    return new Credencial(
      linha.usuarioId,
      linha.hashDaSenha,
      linha.tentativasFalhas,
      linha.bloqueadaAte,
      linha.senhaAlteradaEm,
    );
  }
}

@Injectable()
export class RepositorioDeSessoesTypeorm implements RepositorioDeSessoes {
  constructor(@InjectRepository(SessaoModelo) private readonly tabela: Repository<SessaoModelo>) {}

  async salvar(sessao: Sessao): Promise<void> {
    await this.tabela.save({
      id: sessao.id,
      usuarioId: sessao.usuarioId,
      hashDoToken: sessao.hashDoToken,
      expiraEm: sessao.expiraEm,
      revogadaEm: sessao.revogadaEm,
      criadaEm: sessao.criadaEm,
    });
  }

  async buscarPorHash(hashDoToken: string): Promise<Sessao | null> {
    const linha = await this.tabela.findOneBy({ hashDoToken });
    if (!linha) return null;
    return new Sessao(linha.id, linha.usuarioId, linha.hashDoToken, linha.expiraEm, linha.revogadaEm, linha.criadaEm);
  }

  async revogarTodasDoUsuario(usuarioId: string, agora: Date): Promise<void> {
    await this.tabela.update({ usuarioId, revogadaEm: IsNull() }, { revogadaEm: agora });
  }
}

@Injectable()
export class RepositorioDeTokensDeRecuperacaoTypeorm implements RepositorioDeTokensDeRecuperacao {
  constructor(
    @InjectRepository(TokenDeRecuperacaoModelo) private readonly tabela: Repository<TokenDeRecuperacaoModelo>,
  ) {}

  async salvar(token: TokenDeRecuperacao): Promise<void> {
    await this.tabela.save({
      id: token.id,
      usuarioId: token.usuarioId,
      hashDoToken: token.hashDoToken,
      expiraEm: token.expiraEm,
      usadoEm: token.usadoEm,
    });
  }

  async buscarPorHash(hashDoToken: string): Promise<TokenDeRecuperacao | null> {
    const linha = await this.tabela.findOneBy({ hashDoToken });
    if (!linha) return null;
    return new TokenDeRecuperacao(linha.id, linha.usuarioId, linha.hashDoToken, linha.expiraEm, linha.usadoEm);
  }
}
