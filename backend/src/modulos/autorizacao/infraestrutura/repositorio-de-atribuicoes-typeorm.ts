import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Column, Entity, PrimaryColumn, Repository } from 'typeorm';
import { Papel } from '../contratos/papel';
import { Atribuicao, RepositorioDeAtribuicoes } from '../dominio/repositorio-de-atribuicoes';

/** Tabela pertencente ao módulo Autorização. */
@Entity('autorizacao_atribuicoes')
export class AtribuicaoModelo {
  @PrimaryColumn('varchar', { length: 36 })
  usuarioId: string;

  @Column('varchar', { length: 20 })
  papel: Papel;

  @Column('datetime')
  atualizadoEm: Date;
}

@Injectable()
export class RepositorioDeAtribuicoesTypeorm implements RepositorioDeAtribuicoes {
  constructor(@InjectRepository(AtribuicaoModelo) private readonly tabela: Repository<AtribuicaoModelo>) {}

  async salvar(atribuicao: Atribuicao, agora: Date): Promise<void> {
    await this.tabela.save({ usuarioId: atribuicao.usuarioId, papel: atribuicao.papel, atualizadoEm: agora });
  }

  async buscarPorUsuario(usuarioId: string): Promise<Atribuicao | null> {
    const linha = await this.tabela.findOneBy({ usuarioId });
    return linha ? { usuarioId: linha.usuarioId, papel: linha.papel } : null;
  }

  async listar(): Promise<Atribuicao[]> {
    return (await this.tabela.find()).map((linha) => ({ usuarioId: linha.usuarioId, papel: linha.papel }));
  }
}
