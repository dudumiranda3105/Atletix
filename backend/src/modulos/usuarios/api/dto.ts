import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class AlterarStatusDto {
  @ApiProperty({ description: 'true para ativar a conta, false para desativar' })
  @IsBoolean()
  ativo: boolean;
}
