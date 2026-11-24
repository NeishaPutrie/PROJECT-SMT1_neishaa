import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeIngredientsService } from './recipe-ingredients.service.js';
import { RecipeIngredientsController } from './recipe-ingredients.controller.js';
import { RecipeIngredient } from './entities/recipe-ingredient.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([RecipeIngredient])],
  controllers: [RecipeIngredientsController],
  providers: [RecipeIngredientsService],
})
export class RecipeIngredientsModule {}
