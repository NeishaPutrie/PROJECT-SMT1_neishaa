import { describe, expect, it, vi } from 'vitest';
import type { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RecipesService } from './recipes.service.js';
import { Recipe } from './entities/recipe.entity.js';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity.js';

function createRecipeRepoMock() {
  const repo = {
    create: vi.fn<(input: Partial<Recipe>) => Partial<Recipe>>((input) => input),
    save: vi.fn<(input: Partial<Recipe>) => Promise<Recipe>>(
      async (input) => ({ id: 'r-1', ...input }) as Recipe,
    ),
    find: vi.fn<() => Promise<Recipe[]>>(async () => []),
    findOne: vi.fn<() => Promise<Recipe | null>>(async () => null),
    remove: vi.fn<(input: Recipe) => Promise<Recipe>>(async (input) => input),
  };
  return repo as unknown as Repository<Recipe> & typeof repo;
}

function createPantryRepoMock() {
  const repo = { find: vi.fn<() => Promise<PantryItem[]>>(async () => []) };
  return repo as unknown as Repository<PantryItem> & typeof repo;
}

function pantryItem(
  ingredientId: string,
  quantity: number,
  name: string,
  unit = 'gram',
): PantryItem {
  return {
    ingredientId,
    quantity,
    ingredient: { name, unit },
  } as PantryItem;
}

function recipe(
  id: string,
  title: string,
  items: Array<{ ingredientId: string; quantity: number; name: string }>,
): Recipe {
  return {
    id,
    title,
    description: `${title} desc`,
    servings: 2,
    recipeIngredients: items.map((item) => ({
      ingredientId: item.ingredientId,
      quantity: item.quantity,
      ingredient: { name: item.name, unit: 'gram' },
    })),
  } as unknown as Recipe;
}

describe('RecipesService', () => {
  it('membuat resep baru', async () => {
    const recipes = createRecipeRepoMock();
    const pantry = createPantryRepoMock();
    const service = new RecipesService(recipes, pantry);

    const result = await service.create({
      title: 'Nasi Goreng',
      instructions: '1. Masak',
    });

    expect(result.title).toBe('Nasi Goreng');
    expect(recipes.save).toHaveBeenCalledOnce();
  });

  it('mengambil semua resep beserta bahan', async () => {
    const recipes = createRecipeRepoMock();
    const pantry = createPantryRepoMock();
    const service = new RecipesService(recipes, pantry);

    await service.findAll();

    expect(recipes.find).toHaveBeenCalledWith({
      relations: { recipeIngredients: { ingredient: true } },
      order: { createdAt: 'DESC' },
    });
  });

  it('melempar NotFoundException kalau resep tidak ada', async () => {
    const service = new RecipesService(
      createRecipeRepoMock(),
      createPantryRepoMock(),
    );

    await expect(service.findOne('tidak-ada')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('menghapus resep', async () => {
    const recipes = createRecipeRepoMock();
    recipes.findOne.mockResolvedValue({ id: 'r-1' } as Recipe);
    const service = new RecipesService(recipes, createPantryRepoMock());

    const result = await service.remove('r-1');

    expect(recipes.remove).toHaveBeenCalledOnce();
    expect(result.message).toContain('r-1');
  });

  describe('findRecommendations', () => {
    const rice = recipe('r-1', 'Nasi Goreng', [
      { ingredientId: 'i-1', quantity: 300, name: 'Beras' },
      { ingredientId: 'i-2', quantity: 2, name: 'Telur' },
      { ingredientId: 'i-3', quantity: 30, name: 'Kecap' },
    ]);
    const soup = recipe('r-2', 'Sup Wortel', [
      { ingredientId: 'i-9', quantity: 200, name: 'Wortel' },
    ]);
    const partial = recipe('r-3', 'Ayam Kecap', [
      { ingredientId: 'i-4', quantity: 400, name: 'Ayam' },
      { ingredientId: 'i-3', quantity: 60, name: 'Kecap' },
    ]);

    it('mengembalikan array kosong kalau stok dapur kosong', async () => {
      const recipes = createRecipeRepoMock();
      const pantry = createPantryRepoMock();
      const service = new RecipesService(recipes, pantry);

      expect(await service.findRecommendations('u-1')).toEqual([]);
      // Tidak perlu query resep kalau stok kosong.
      expect(recipes.find).not.toHaveBeenCalled();
    });

    it('menandai resep yang semua bahannya cukup sebagai canCook', async () => {
      const recipes = createRecipeRepoMock();
      recipes.find.mockResolvedValue([rice, soup]);
      const pantry = createPantryRepoMock();
      pantry.find.mockResolvedValue([
        pantryItem('i-1', 2000, 'Beras'),
        pantryItem('i-2', 6, 'Telur'),
        pantryItem('i-3', 100, 'Kecap'),
      ]);
      const service = new RecipesService(recipes, pantry);

      const [top] = await service.findRecommendations('u-1');

      expect(top.title).toBe('Nasi Goreng');
      expect(top.canCook).toBe(true);
      expect(top.matchPercent).toBe(100);
      // Sup Wortel bahannya tidak ada sama sekali, jadi tidak ikut.
      expect(top.recipeId).toBe('r-1');
    });

    it('menandai bahan yang kurang sebagai partial', async () => {
      const recipes = createRecipeRepoMock();
      recipes.find.mockResolvedValue([partial]);
      const pantry = createPantryRepoMock();
      pantry.find.mockResolvedValue([
        pantryItem('i-4', 100, 'Ayam'),
        pantryItem('i-3', 100, 'Kecap'),
      ]);
      const service = new RecipesService(recipes, pantry);

      const [result] = await service.findRecommendations('u-1');

      expect(result.canCook).toBe(false);
      expect(result.matchedIngredients).toBe(1);
      const ayam = result.ingredients.find((i) => i.name === 'Ayam');
      expect(ayam?.status).toBe('partial');
      expect(ayam?.available).toBe(100);
      expect(ayam?.required).toBe(400);
    });

    it('menjumlahkan stok bahan yang sama dari beberapa baris', async () => {
      const recipes = createRecipeRepoMock();
      recipes.find.mockResolvedValue([rice]);
      const pantry = createPantryRepoMock();
      pantry.find.mockResolvedValue([
        pantryItem('i-1', 100, 'Beras'),
        pantryItem('i-1', 250, 'Beras'),
        pantryItem('i-2', 2, 'Telur'),
        pantryItem('i-3', 50, 'Kecap'),
      ]);
      const service = new RecipesService(recipes, pantry);

      const [result] = await service.findRecommendations('u-1');
      const beras = result.ingredients.find((i) => i.name === 'Beras');

      expect(beras?.available).toBe(350);
      expect(beras?.status).toBe('enough');
    });

    it('mengurutkan resep yang bisa dimasak lebih dulu', async () => {
      const recipes = createRecipeRepoMock();
      recipes.find.mockResolvedValue([partial, soup, rice]);
      const pantry = createPantryRepoMock();
      pantry.find.mockResolvedValue([
        pantryItem('i-1', 2000, 'Beras'),
        pantryItem('i-2', 6, 'Telur'),
        pantryItem('i-3', 100, 'Kecap'),
        pantryItem('i-4', 50, 'Ayam'),
        pantryItem('i-9', 200, 'Wortel'),
      ]);
      const service = new RecipesService(recipes, pantry);

      const result = await service.findRecommendations('u-1');

      expect(result.map((r) => r.canCook)).toEqual([true, true, false]);
      // Di antara yang bisa dimasak, urutan asli dipertahankan (stabil).
      expect(result[0].title).toBe('Nasi Goreng');
      expect(result[2].title).toBe('Ayam Kecap');
    });

    it('mengabaikan resep yang tidak punya bahan', async () => {
      const recipes = createRecipeRepoMock();
      recipes.find.mockResolvedValue([
        { id: 'r-x', title: 'Resep Kosong', recipeIngredients: [] } as unknown as Recipe,
      ]);
      const pantry = createPantryRepoMock();
      pantry.find.mockResolvedValue([pantryItem('i-1', 100, 'Beras')]);
      const service = new RecipesService(recipes, pantry);

      expect(await service.findRecommendations('u-1')).toEqual([]);
    });
  });
});
