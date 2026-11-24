import { describe, expect, it, vi } from 'vitest';
import type { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RecipeIngredientsService } from './recipe-ingredients.service.js';
import { RecipeIngredient } from './entities/recipe-ingredient.entity.js';

function createRepositoryMock() {
  const repo = {
    create: vi.fn<
      (input: Partial<RecipeIngredient>) => Partial<RecipeIngredient>
    >((input) => input),
    save: vi.fn<(input: Partial<RecipeIngredient>) => Promise<RecipeIngredient>>(
      async (input) => ({ id: 'ri-1', ...input }) as RecipeIngredient,
    ),
    find: vi.fn<() => Promise<RecipeIngredient[]>>(async () => []),
    findOne: vi.fn<() => Promise<RecipeIngredient | null>>(async () => null),
    remove: vi.fn<(input: RecipeIngredient) => Promise<RecipeIngredient>>(
      async (input) => input,
    ),
  };
  return repo as unknown as Repository<RecipeIngredient> & typeof repo;
}

describe('RecipeIngredientsService', () => {
  it('menghubungkan bahan ke resep', async () => {
    const repo = createRepositoryMock();
    const service = new RecipeIngredientsService(repo);

    const result = await service.create({
      recipeId: 'r-1',
      ingredientId: 'i-1',
      quantity: 200,
    });

    expect(result.id).toBe('ri-1');
    expect(repo.save).toHaveBeenCalledOnce();
  });

  it('mengambil semua relasi beserta resep dan bahan', async () => {
    const repo = createRepositoryMock();
    const service = new RecipeIngredientsService(repo);

    await service.findAll();

    expect(repo.find).toHaveBeenCalledWith({
      relations: { recipe: true, ingredient: true },
    });
  });

  it('melempar NotFoundException kalau relasi tidak ada', async () => {
    const service = new RecipeIngredientsService(createRepositoryMock());

    await expect(service.findOne('tidak-ada')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('mengubah jumlah bahan', async () => {
    const repo = createRepositoryMock();
    repo.findOne.mockResolvedValue({
      id: 'ri-1',
      quantity: 100,
    } as RecipeIngredient);
    const service = new RecipeIngredientsService(repo);

    const result = await service.update('ri-1', { quantity: 300 });

    expect(result.quantity).toBe(300);
  });

  it('menghapus relasi', async () => {
    const repo = createRepositoryMock();
    repo.findOne.mockResolvedValue({ id: 'ri-1' } as RecipeIngredient);
    const service = new RecipeIngredientsService(repo);

    const result = await service.remove('ri-1');

    expect(repo.remove).toHaveBeenCalledOnce();
    expect(result.message).toContain('ri-1');
  });
});
