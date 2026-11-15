import { Inject, Injectable } from '@nestjs/common';
import { RELOGIO, Relogio } from '../../../compartilhado/tempo/relogio';
import { DIRETORIO_DE_USUARIOS, DiretorioDeUsuarios, UsuarioResumo } from '../../usuarios/contratos';
import { Credencial } from '../dominio/credencial';
import { validarSenha } from '../dominio/politica-de-senha';
import {
  HASH_DE_SENHA,
  HashDeSenha,
  REPOSITORIO_DE_CREDENCIAIS,
  RepositorioDeCredenciais,
} from '../dominio/portas';

/**
 * Cria uma conta: o cadastro da pessoa fica com o módulo Usuários (via contrato) e a senha fica aqui.
 * A conta nasce com o papel padrão; promover alguém é responsabilidade da Autorização.
 */
@Injectable()
export class CadastrarConta {
  constructor(
    @Inject(DIRETORIO_DE_USUARIOS) private readonly usuarios: DiretorioDeUsuarios,
    @Inject(REPOSITORIO_DE_CREDENCIAIS) private readonly credenciais: RepositorioDeCredenciais,
    @Inject(HASH_DE_SENHA) private readonly hash: HashDeSenha,
    @Inject(RELOGIO) private readonly relogio: Relogio,
  ) {}

  async executar(dados: { nome: string; email: string; senha: string }): Promise<UsuarioResumo> {
    // A senha é validada antes de criar o usuário para não deixar um cadastro sem credencial.
    validarSenha(dados.senha);
    const usuario = await this.usuarios.cadastrar({ nome: dados.nome, email: dados.email });
    const hashDaSenha = await this.hash.gerar(dados.senha);
    await this.credenciais.salvar(Credencial.nova(usuario.id, hashDaSenha, this.relogio.agora()));
    return usuario;
  }
}
