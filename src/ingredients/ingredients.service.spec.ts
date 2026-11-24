import { describe, expect, it, vi } from 'vitest';
import type { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { IngredientsService } from './ingredients.service.js';
import { Ingredient } from './entities/ingredient.entity.js';

function createRepositoryMock() {
  const repo = {
    create: vi.fn<(input: Partial<Ingredient>) => Partial<Ingredient>>(
      (input) => input,
    ),
    save: vi.fn<(input: Partial<Ingredient>) => Promise<Ingredient>>(
      async (input) => ({ id: 'i-1', ...input }) as Ingredient,
    ),
    find: vi.fn<() => Promise<Ingredient[]>>(async () => []),
    findOne: vi.fn<() => Promise<Ingredient | null>>(async () => null),
    remove: vi.fn<(input: Ingredient) => Promise<Ingredient>>(
      async (input) => input,
    ),
  };
  return repo as unknown as Repository<Ingredient> & typeof repo;
}

describe('IngredientsService', () => {
  it('membuat bahan baru', async () => {
    const repo = createRepositoryMock();
    const service = new IngredientsService(repo);

    const result = await service.create({
      name: 'Beras',
      category: 'Biji-bijian',
      unit: 'gram',
    });

    expect(result.name).toBe('Beras');
    expect(repo.save).toHaveBeenCalledOnce();
  });

  it('mengambil semua bahan urut nama', async () => {
    const repo = createRepositoryMock();
    const service = new IngredientsService(repo);

    await service.findAll();

    expect(repo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
  });

  it('melempar NotFoundException kalau bahan tidak ada', async () => {
    const repo = createRepositoryMock();
    const service = new IngredientsService(repo);

    await expect(service.findOne('tidak-ada')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('mengubah data bahan', async () => {
    const repo = createRepositoryMock();
    repo.findOne.mockResolvedValue({ id: 'i-1', name: 'Beras' } as Ingredient);
    const service = new IngredientsService(repo);

    const result = await service.update('i-1', { name: 'Beras Merah' });

    expect(result.name).toBe('Beras Merah');
  });

  it('menghapus bahan', async () => {
    const repo = createRepositoryMock();
    repo.findOne.mockResolvedValue({ id: 'i-1' } as Ingredient);
    const service = new IngredientsService(repo);

    const result = await service.remove('i-1');

    expect(repo.remove).toHaveBeenCalledOnce();
    expect(result.message).toContain('i-1');
  });
});
