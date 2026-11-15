import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Column, Entity, Index, LessThan, MoreThanOrEqual, PrimaryColumn, Repository, And } from 'typeorm';
import { Checkin, RepositorioDeCheckins } from '../dominio/checkin';

/** Tabela pertencente ao módulo Check-in. */
@Entity('checkin_checkins')
export class CheckinModelo {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column('varchar', { length: 36 })
  alunoId: string;

  @Index()
  @Column('datetime')
  registradoEm: Date;
}

@Injectable()
export class RepositorioDeCheckinsTypeorm implements RepositorioDeCheckins {
  constructor(@InjectRepository(CheckinModelo) private readonly tabela: Repository<CheckinModelo>) {}

  async salvar(checkin: Checkin): Promise<void> {
    await this.tabela.save({ id: checkin.id, alunoId: checkin.alunoId, registradoEm: checkin.registradoEm });
  }

  async existeNoIntervalo(alunoId: string, inicio: Date, fim: Date): Promise<boolean> {
    return this.tabela.existsBy({ alunoId, registradoEm: And(MoreThanOrEqual(inicio), LessThan(fim)) });
  }

  async listarNoIntervalo(inicio: Date, fim: Date): Promise<Checkin[]> {
    const linhas = await this.tabela.find({
      where: { registradoEm: And(MoreThanOrEqual(inicio), LessThan(fim)) },
      order: { registradoEm: 'DESC' },
    });
    return linhas.map(paraDominio);
  }

  async listarDoAluno(alunoId: string, limite: number): Promise<Checkin[]> {
    const linhas = await this.tabela.find({ where: { alunoId }, order: { registradoEm: 'DESC' }, take: limite });
    return linhas.map(paraDominio);
  }
}

function paraDominio(linha: CheckinModelo): Checkin {
  return new Checkin(linha.id, linha.alunoId, linha.registradoEm);
}
