import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Column, Entity, Index, PrimaryColumn, Repository } from 'typeorm';
import { Matricula, Plano, RepositorioDeMatriculas } from '../dominio/matricula';

/** Tabela pertencente ao módulo Matrículas. */
@Entity('matriculas_matriculas')
export class MatriculaModelo {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column('varchar', { length: 36 })
  alunoId: string;

  @Column('varchar', { length: 20 })
  plano: Plano;

  @Column('datetime')
  inicioEm: Date;

  @Column('datetime')
  validaAte: Date;

  @Column('datetime')
  criadaEm: Date;
}

@Injectable()
export class RepositorioDeMatriculasTypeorm implements RepositorioDeMatriculas {
  constructor(@InjectRepository(MatriculaModelo) private readonly tabela: Repository<MatriculaModelo>) {}

  async salvar(matricula: Matricula): Promise<void> {
    await this.tabela.save({
      id: matricula.id,
      alunoId: matricula.alunoId,
      plano: matricula.plano,
      inicioEm: matricula.inicioEm,
      validaAte: matricula.validaAte,
      criadaEm: matricula.criadaEm,
    });
  }

  async listarDoAluno(alunoId: string): Promise<Matricula[]> {
    const linhas = await this.tabela.find({ where: { alunoId }, order: { validaAte: 'DESC' } });
    return linhas.map(
      (l) => new Matricula(l.id, l.alunoId, l.plano, l.inicioEm, l.validaAte, l.criadaEm),
    );
  }
}
