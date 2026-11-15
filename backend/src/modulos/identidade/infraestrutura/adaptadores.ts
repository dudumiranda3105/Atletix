import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { EmissorDeTokenDeAcesso, GeradorDeTokenOpaco, HashDeSenha } from '../dominio/portas';

/**
 * Adaptadores de tecnologia do módulo Identidade. O algoritmo de hash e o formato do token
 * ficam isolados aqui: trocar bcrypt por argon2, ou JWT por outro formato, não afeta os casos de uso.
 */
@Injectable()
export class HashDeSenhaBcrypt implements HashDeSenha {
  private readonly custo: number;

  constructor(configuracao: ConfigService) {
    this.custo = Number(configuracao.get('BCRYPT_CUSTO', 10));
  }

  gerar(senha: string): Promise<string> {
    return hash(senha, this.custo);
  }

  conferir(senha: string, hashDaSenha: string): Promise<boolean> {
    return compare(senha, hashDaSenha);
  }
}

@Injectable()
export class EmissorDeTokenJwt implements EmissorDeTokenDeAcesso {
  private readonly expiraEmSegundos: number;

  constructor(
    private readonly jwt: JwtService,
    configuracao: ConfigService,
  ) {
    this.expiraEmSegundos = Number(configuracao.get('TOKEN_DE_ACESSO_MINUTOS', 15)) * 60;
  }

  async emitir(usuarioId: string): Promise<{ token: string; expiraEmSegundos: number }> {
    // O token leva só o id (sub). Papel e status são consultados a cada requisição.
    const token = await this.jwt.signAsync({ sub: usuarioId }, { expiresIn: this.expiraEmSegundos });
    return { token, expiraEmSegundos: this.expiraEmSegundos };
  }

  async verificar(token: string): Promise<string | null> {
    try {
      const conteudo = await this.jwt.verifyAsync<{ sub?: string }>(token);
      return conteudo.sub ?? null;
    } catch {
      return null;
    }
  }
}

@Injectable()
export class GeradorDeTokenOpacoCrypto implements GeradorDeTokenOpaco {
  gerar(): { token: string; hash: string } {
    const token = randomBytes(32).toString('base64url');
    return { token, hash: this.resumir(token) };
  }

  resumir(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
