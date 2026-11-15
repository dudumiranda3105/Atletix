import { Inject, Injectable } from '@nestjs/common';
import { NaoEncontrado, RegraViolada } from '../../../compartilhado/dominio/erros';
import { PUBLICADOR_DE_EVENTOS, PublicadorDeEventos } from '../../../compartilhado/eventos/evento-de-dominio';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import { UsuarioDesativado, UsuarioReativado } from '../contratos/eventos';
import { REPOSITORIO_DE_USUARIOS, RepositorioDeUsuarios } from '../dominio/repositorio-de-usuarios';
import { Usuario } from '../dominio/usuario';

@Injectable()
export class AlterarStatusDoUsuario {
  constructor(
    @Inject(REPOSITORIO_DE_USUARIOS) private readonly usuarios: RepositorioDeUsuarios,
    @Inject(PUBLICADOR_DE_EVENTOS) private readonly eventos: PublicadorDeEventos,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  async executar(dados: { usuarioId: string; ativo: boolean; solicitanteId: string }): Promise<Usuario> {
    const usuario = await this.usuarios.buscarPorId(dados.usuarioId);
    if (!usuario) throw new NaoEncontrado('USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado.');

    // Impede que alguém se tranque para fora do sistema (e garante ao menos um administrador ativo).
    if (!dados.ativo && usuario.id === dados.solicitanteId) {
      throw new RegraViolada('NAO_PODE_DESATIVAR_A_SI_MESMO', 'Você não pode desativar a própria conta.');
    }

    if (usuario.definirAtivo(dados.ativo)) {
      await this.usuarios.salvar(usuario);
      const agora = this.relogio.agora();
      // Quem reage a isto (ex.: Identidade encerrando as sessões) não é conhecido por este módulo.
      this.eventos.publicar(
        dados.ativo
          ? new UsuarioReativado(usuario.id, dados.solicitanteId, agora)
          : new UsuarioDesativado(usuario.id, dados.solicitanteId, agora),
      );
    }
    return usuario;
  }
}
