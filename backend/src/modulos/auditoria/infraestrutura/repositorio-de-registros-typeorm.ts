import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Column, Entity, Index, PrimaryColumn, Repository } from 'typeorm';
import { RegistroDeAuditoria, RepositorioDeRegistros } from '../dominio/registro';

/** Tabela pertencente ao módulo Auditoria. */
@Entity('auditoria_registros')
export class RegistroModelo {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 80 })
  tipo: string;

  @Column('varchar', { length: 36, nullable: true })
  usuarioId: string | null;

  @Column('varchar', { length: 300 })
  descricao: string;

  @Index()
  @Column('datetime')
  ocorridoEm: Date;
}

@Injectable()
export class RepositorioDeRegistrosTypeorm implements RepositorioDeRegistros {
  constructor(@InjectRepository(RegistroModelo) private readonly tabela: Repository<RegistroModelo>) {}

  async salvar(registro: RegistroDeAuditoria): Promise<void> {
    await this.tabela.save({
      id: registro.id,
      tipo: registro.tipo,
      usuarioId: registro.usuarioId,
      descricao: registro.descricao,
      ocorridoEm: registro.ocorridoEm,
    });
  }

  async listarRecentes(limite: number): Promise<RegistroDeAuditoria[]> {
    const linhas = await this.tabela.find({ order: { ocorridoEm: 'DESC' }, take: limite });
    return linhas.map((l) => new RegistroDeAuditoria(l.id, l.tipo, l.usuarioId, l.descricao, l.ocorridoEm));
  }
}
