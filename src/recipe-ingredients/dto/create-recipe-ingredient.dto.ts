import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateRecipeIngredientDto {
  @ApiProperty({ example: '6f1c3a1e-6a1b-4c1e-9f2a-1b2c3d4e5f60' })
  @IsUUID('4', { message: 'recipeId harus berupa UUID' })
  recipeId: string;

  @ApiProperty({ example: '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c40' })
  @IsUUID('4', { message: 'ingredientId harus berupa UUID' })
  ingredientId: string;

  @ApiProperty({ example: 200 })
  @IsNumber({}, { message: 'quantity harus berupa angka' })
  @Min(0, { message: 'quantity tidak boleh negatif' })
  quantity: number;
}
