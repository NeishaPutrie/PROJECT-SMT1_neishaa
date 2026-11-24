import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRecipeDto {
  @ApiProperty({ example: 'Nasi Goreng Sederhana' })
  @IsString()
  @IsNotEmpty({ message: 'title tidak boleh kosong' })
  title: string;

  @ApiPropertyOptional({ example: 'Nasi goreng rumahan untuk sarapan' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '1. Tumis bumbu\n2. Masukkan nasi\n3. Aduk rata' })
  @IsString()
  @IsNotEmpty({ message: 'instructions tidak boleh kosong' })
  instructions: string;

  @ApiPropertyOptional({ example: 2, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'servings minimal 1' })
  servings?: number;
}
