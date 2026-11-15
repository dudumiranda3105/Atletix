import { Inject, Injectable } from '@nestjs/common';
import { Conflito } from '../../../compartilhado/dominio/erros';
import { PUBLICADOR_DE_EVENTOS, PublicadorDeEventos } from '../../../compartilhado/eventos/evento-de-dominio';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import { UsuarioCadastrado } from '../contratos/eventos';
import { REPOSITORIO_DE_USUARIOS, RepositorioDeUsuarios } from '../dominio/repositorio-de-usuarios';
import { Usuario } from '../dominio/usuario';

@Injectable()
export class CadastrarUsuario {
  constructor(
    @Inject(REPOSITORIO_DE_USUARIOS) private readonly usuarios: RepositorioDeUsuarios,
    @Inject(PUBLICADOR_DE_EVENTOS) private readonly eventos: PublicadorDeEventos,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  async executar(dados: { nome: string; email: string }): Promise<Usuario> {
    const agora = this.relogio.agora();
    const usuario = Usuario.novo(dados, agora);
    if (await this.usuarios.buscarPorEmail(usuario.email)) {
      throw new Conflito('EMAIL_JA_CADASTRADO', 'Já existe uma conta com este e-mail.');
    }
    await this.usuarios.salvar(usuario);
    this.eventos.publicar(new UsuarioCadastrado(usuario.id, usuario.email, agora));
    return usuario;
  }
}
