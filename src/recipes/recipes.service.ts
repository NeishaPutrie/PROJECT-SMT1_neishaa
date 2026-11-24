import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';
import { Recipe } from './entities/recipe.entity.js';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity.js';

export interface RecommendationItem {
  ingredientId: string;
  name: string;
  unit: string;
  required: number;
  available: number;
  status: 'enough' | 'partial' | 'missing';
}

export interface RecipeRecommendation {
  recipeId: string;
  title: string;
  description: string;
  servings: number;
  canCook: boolean;
  matchedIngredients: number;
  totalIngredients: number;
  matchPercent: number;
  ingredients: RecommendationItem[];
}

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipesRepository: Repository<Recipe>,
    @InjectRepository(PantryItem)
    private readonly pantryItemsRepository: Repository<PantryItem>,
  ) {}

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    const recipe = this.recipesRepository.create(createRecipeDto);
    return this.recipesRepository.save(recipe);
  }

  async findAll(): Promise<Recipe[]> {
    return this.recipesRepository.find({
      relations: { recipeIngredients: { ingredient: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Recipe> {
    const recipe = await this.recipesRepository.findOne({
      where: { id },
      relations: { recipeIngredients: { ingredient: true } },
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe dengan id ${id} tidak ditemukan`);
    }
    return recipe;
  }

  async findRecommendations(userId: string): Promise<RecipeRecommendation[]> {
    const pantryItems = await this.pantryItemsRepository.find({
      where: { userId },
    });

    if (pantryItems.length === 0) {
      return [];
    }

    const stock = new Map<string, number>();
    for (const item of pantryItems) {
      const current = stock.get(item.ingredientId) ?? 0;
      stock.set(item.ingredientId, current + Number(item.quantity ?? 0));
    }

    const recipes = await this.recipesRepository.find({
      relations: { recipeIngredients: { ingredient: true } },
    });

    const recommendations: RecipeRecommendation[] = recipes.map((recipe) => {
      const items: RecommendationItem[] = recipe.recipeIngredients.map(
        (recipeIngredient) => {
          const required = Number(recipeIngredient.quantity ?? 0);
          const available = stock.get(recipeIngredient.ingredientId) ?? 0;

          let status: RecommendationItem['status'] = 'missing';
          if (available >= required && required > 0) {
            status = 'enough';
          } else if (available > 0) {
            status = 'partial';
          }

          return {
            ingredientId: recipeIngredient.ingredientId,
            name: recipeIngredient.ingredient?.name ?? 'Tidak diketahui',
            unit: recipeIngredient.ingredient?.unit ?? '',
            required,
            available,
            status,
          };
        },
      );

      const matchedIngredients = items.filter(
        (item) => item.status === 'enough',
      ).length;
      const totalIngredients = items.length;
      const matchPercent =
        totalIngredients === 0
          ? 0
          : Math.round((matchedIngredients / totalIngredients) * 100);

      return {
        recipeId: recipe.id,
        title: recipe.title,
        description: recipe.description,
        servings: recipe.servings,
        canCook: totalIngredients > 0 && matchedIngredients === totalIngredients,
        matchedIngredients,
        totalIngredients,
        matchPercent,
        ingredients: items,
      };
    });

    return recommendations
      .filter((item) => item.matchedIngredients > 0)
      .sort((a, b) => {
        if (a.canCook !== b.canCook) {
          return a.canCook ? -1 : 1;
        }
        return b.matchPercent - a.matchPercent;
      });
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<Recipe> {
    const recipe = await this.findOne(id);
    Object.assign(recipe, updateRecipeDto);
    return this.recipesRepository.save(recipe);
  }

  async remove(id: string): Promise<{ message: string }> {
    const recipe = await this.findOne(id);
    await this.recipesRepository.remove(recipe);
    return { message: `Recipe dengan id ${id} berhasil dihapus` };
  }
}
