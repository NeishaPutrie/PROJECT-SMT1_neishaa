import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixturesService } from './fixtures.service.js';
import { FixturesController } from './fixtures.controller.js';
import { User } from '../users/entities/user.entity.js';
import { Ingredient } from '../ingredients/entities/ingredient.entity.js';
import { Recipe } from '../recipes/entities/recipe.entity.js';
import { RecipeIngredient } from '../recipe-ingredients/entities/recipe-ingredient.entity.js';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity.js';
import { WasteLog } from '../waste-logs/entities/waste-log.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Ingredient,
      Recipe,
      RecipeIngredient,
      PantryItem,
      WasteLog,
    ]),
  ],
  controllers: [FixturesController],
  providers: [FixturesService],
})
export class FixturesModule {}
