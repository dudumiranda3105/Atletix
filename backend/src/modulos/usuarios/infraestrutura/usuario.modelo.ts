import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Tabela pertencente ao módulo Usuários. Nenhum outro módulo lê ou grava aqui. */
@Entity('usuarios_usuarios')
export class UsuarioModelo {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 120 })
  nome: string;

  @Column('varchar', { length: 160, unique: true })
  email: string;

  @Column('boolean')
  ativo: boolean;

  @Column('datetime')
  criadoEm: Date;
}
