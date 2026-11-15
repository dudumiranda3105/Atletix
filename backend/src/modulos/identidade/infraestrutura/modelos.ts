import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/** Tabelas pertencentes ao módulo Identidade (prefixo "identidade_"). */
@Entity('identidade_credenciais')
export class CredencialModelo {
  @PrimaryColumn('varchar', { length: 36 })
  usuarioId: string;

  @Column('varchar', { length: 100 })
  hashDaSenha: string;

  @Column('integer')
  tentativasFalhas: number;

  @Column('datetime', { nullable: true })
  bloqueadaAte: Date | null;

  @Column('datetime')
  senhaAlteradaEm: Date;
}

@Entity('identidade_sessoes')
export class SessaoModelo {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column('varchar', { length: 36 })
  usuarioId: string;

  @Column('varchar', { length: 64, unique: true })
  hashDoToken: string;

  @Column('datetime')
  expiraEm: Date;

  @Column('datetime', { nullable: true })
  revogadaEm: Date | null;

  @Column('datetime')
  criadaEm: Date;
}

@Entity('identidade_tokens_de_recuperacao')
export class TokenDeRecuperacaoModelo {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 36 })
  usuarioId: string;

  @Column('varchar', { length: 64, unique: true })
  hashDoToken: string;

  @Column('datetime')
  expiraEm: Date;

  @Column('datetime', { nullable: true })
  usadoEm: Date | null;
}
