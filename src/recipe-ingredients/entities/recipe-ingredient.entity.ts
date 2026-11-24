import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity.js';
import { Ingredient } from '../../ingredients/entities/ingredient.entity.js';

@Entity('recipe_ingredients')
export class RecipeIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recipe_id' })
  recipeId: string;

  @Column({ name: 'ingredient_id' })
  ingredientId: string;

  @Column({ type: 'double precision', default: 0 })
  quantity: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.recipeIngredients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;

  @ManyToOne(
    () => Ingredient,
    (ingredient) => ingredient.recipeIngredients,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;
}
