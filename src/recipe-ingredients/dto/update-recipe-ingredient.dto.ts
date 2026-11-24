import { PartialType } from '@nestjs/swagger';
import { CreateRecipeIngredientDto } from './create-recipe-ingredient.dto.js';

export class UpdateRecipeIngredientDto extends PartialType(CreateRecipeIngredientDto) {}
