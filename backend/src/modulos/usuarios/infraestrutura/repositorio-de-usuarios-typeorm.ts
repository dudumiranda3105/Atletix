import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositorioDeUsuarios } from '../dominio/repositorio-de-usuarios';
import { Usuario } from '../dominio/usuario';
import { UsuarioModelo } from './usuario.modelo';

@Injectable()
export class RepositorioDeUsuariosTypeorm implements RepositorioDeUsuarios {
  constructor(@InjectRepository(UsuarioModelo) private readonly tabela: Repository<UsuarioModelo>) {}

  async salvar(usuario: Usuario): Promise<void> {
    await this.tabela.save({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      ativo: usuario.ativo,
      criadoEm: usuario.criadoEm,
    });
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const linha = await this.tabela.findOneBy({ id });
    return linha ? paraDominio(linha) : null;
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const linha = await this.tabela.findOneBy({ email });
    return linha ? paraDominio(linha) : null;
  }

  async listar(): Promise<Usuario[]> {
    return (await this.tabela.find({ order: { nome: 'ASC' } })).map(paraDominio);
  }
}

function paraDominio(linha: UsuarioModelo): Usuario {
  return new Usuario(linha.id, linha.nome, linha.email, linha.ativo, linha.criadoEm);
}
