import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecipeIngredientDto } from './dto/create-recipe-ingredient.dto.js';
import { UpdateRecipeIngredientDto } from './dto/update-recipe-ingredient.dto.js';
import { RecipeIngredient } from './entities/recipe-ingredient.entity.js';

@Injectable()
export class RecipeIngredientsService {
  constructor(
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientsRepository: Repository<RecipeIngredient>,
  ) {}

  async create(
    createRecipeIngredientDto: CreateRecipeIngredientDto,
  ): Promise<RecipeIngredient> {
    const recipeIngredient = this.recipeIngredientsRepository.create(
      createRecipeIngredientDto,
    );
    return this.recipeIngredientsRepository.save(recipeIngredient);
  }

  async findAll(): Promise<RecipeIngredient[]> {
    return this.recipeIngredientsRepository.find({
      relations: { recipe: true, ingredient: true },
    });
  }

  async findOne(id: string): Promise<RecipeIngredient> {
    const recipeIngredient = await this.recipeIngredientsRepository.findOne({
      where: { id },
      relations: { recipe: true, ingredient: true },
    });
    if (!recipeIngredient) {
      throw new NotFoundException(
        `RecipeIngredient dengan id ${id} tidak ditemukan`,
      );
    }
    return recipeIngredient;
  }

  async update(
    id: string,
    updateRecipeIngredientDto: UpdateRecipeIngredientDto,
  ): Promise<RecipeIngredient> {
    const recipeIngredient = await this.findOne(id);
    Object.assign(recipeIngredient, updateRecipeIngredientDto);
    return this.recipeIngredientsRepository.save(recipeIngredient);
  }

  async remove(id: string): Promise<{ message: string }> {
    const recipeIngredient = await this.findOne(id);
    await this.recipeIngredientsRepository.remove(recipeIngredient);
    return { message: `RecipeIngredient dengan id ${id} berhasil dihapus` };
  }
}
