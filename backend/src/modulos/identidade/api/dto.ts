import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CadastroDto {
  @ApiProperty({ example: 'Maria Souza' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  nome: string;

  @ApiProperty({ example: 'maria@exemplo.com' })
  @IsEmail()
  @MaxLength(160)
  email: string;

  @ApiProperty({ description: 'Mínimo de 8 caracteres, com letras e números' })
  @IsString()
  @MaxLength(72)
  senha: string;
}

export class EntrarDto {
  @ApiProperty({ example: 'maria@exemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MaxLength(72)
  senha: string;
}

export class TokenDeRenovacaoDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  tokenDeRenovacao: string;
}

export class TrocarSenhaDto {
  @ApiProperty()
  @IsString()
  @MaxLength(72)
  senhaAtual: string;

  @ApiProperty({ description: 'Mínimo de 8 caracteres, com letras e números' })
  @IsString()
  @MaxLength(72)
  novaSenha: string;
}

export class RecuperarSenhaDto {
  @ApiProperty({ example: 'maria@exemplo.com' })
  @IsEmail()
  email: string;
}

export class RedefinirSenhaDto {
  @ApiProperty({ description: 'Token recebido por e-mail' })
  @IsString()
  @MaxLength(200)
  token: string;

  @ApiProperty({ description: 'Mínimo de 8 caracteres, com letras e números' })
  @IsString()
  @MaxLength(72)
  novaSenha: string;
}
