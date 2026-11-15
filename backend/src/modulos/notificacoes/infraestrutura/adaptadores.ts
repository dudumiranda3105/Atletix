import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Column, Entity, PrimaryColumn, Repository } from 'typeorm';
import { EnviadorDeEmail, Mensagem, RepositorioDeMensagens } from '../dominio/mensagem';

/** Tabela pertencente ao módulo Notificações. */
@Entity('notificacoes_mensagens')
export class MensagemModelo {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 160 })
  destinatario: string;

  @Column('varchar', { length: 200 })
  assunto: string;

  @Column('text')
  corpo: string;

  @Column('datetime')
  criadaEm: Date;
}

@Injectable()
export class RepositorioDeMensagensTypeorm implements RepositorioDeMensagens {
  constructor(@InjectRepository(MensagemModelo) private readonly tabela: Repository<MensagemModelo>) {}

  async salvar(mensagem: Mensagem): Promise<void> {
    await this.tabela.save({
      id: mensagem.id,
      destinatario: mensagem.destinatario,
      assunto: mensagem.assunto,
      corpo: mensagem.corpo,
      criadaEm: mensagem.criadaEm,
    });
  }

  async listarRecentes(limite: number): Promise<Mensagem[]> {
    const linhas = await this.tabela.find({ order: { criadaEm: 'DESC' }, take: limite });
    return linhas.map((l) => new Mensagem(l.id, l.destinatario, l.assunto, l.corpo, l.criadaEm));
  }
}

/**
 * Envio simulado: apenas registra no log. A mensagem completa fica na caixa de saída,
 * visível para o administrador. Em produção, esta classe é substituída por um adaptador SMTP.
 */
@Injectable()
export class EnviadorDeEmailSimulado implements EnviadorDeEmail {
  private readonly registro = new Logger('E-mail simulado');

  async enviar(mensagem: Mensagem): Promise<void> {
    this.registro.log(`Para ${mensagem.destinatario}: ${mensagem.assunto}`);
  }
}
