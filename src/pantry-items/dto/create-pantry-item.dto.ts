import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePantryItemDto {
  @ApiProperty({ example: '6f1c3a1e-6a1b-4c1e-9f2a-1b2c3d4e5f60' })
  @IsUUID('4', { message: 'userId harus berupa UUID' })
  userId: string;

  @ApiProperty({ example: '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c40' })
  @IsUUID('4', { message: 'ingredientId harus berupa UUID' })
  ingredientId: string;

  @ApiProperty({ example: 500 })
  @IsNumber({}, { message: 'quantity harus berupa angka' })
  @Min(0, { message: 'quantity tidak boleh negatif' })
  quantity: number;

  @ApiPropertyOptional({ example: 'gram' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Tanggal kadaluarsa (format YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'expiresAt harus format tanggal YYYY-MM-DD' })
  expiresAt?: string;
}
