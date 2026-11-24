import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({ example: 'Beras' })
  @IsString()
  @IsNotEmpty({ message: 'name tidak boleh kosong' })
  name: string;

  @ApiPropertyOptional({ example: 'Biji-bijian' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'gram' })
  @IsString()
  @IsNotEmpty({ message: 'unit tidak boleh kosong' })
  unit: string;
}
