import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesService } from './recipes.service.js';
import { RecipesController } from './recipes.controller.js';
import { Recipe } from './entities/recipe.entity.js';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, PantryItem])],
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}
