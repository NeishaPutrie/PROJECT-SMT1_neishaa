import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecipeIngredientsController } from './recipe-ingredients.controller.js';
import { RecipeIngredientsService } from './recipe-ingredients.service.js';

describe('RecipeIngredientsController', () => {
  let controller: RecipeIngredientsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      create: vi.fn(async (dto) => ({ id: 'ri-1', ...dto })),
      findAll: vi.fn(async () => []),
      findOne: vi.fn(async (id) => ({ id })),
      update: vi.fn(async (id, dto) => ({ id, ...dto })),
      remove: vi.fn(async (id) => ({ message: `Relasi ${id} dihapus` })),
    };
    controller = new RecipeIngredientsController(
      service as unknown as RecipeIngredientsService,
    );
  });

  it('meneruskan dto saat create', async () => {
    const dto = { recipeId: 'r-1', ingredientId: 'i-1', quantity: 200 };

    await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('meneruskan id string ke findOne', async () => {
    await controller.findOne('ri-1');

    expect(service.findOne).toHaveBeenCalledWith('ri-1');
  });

  it('meneruskan id dan dto saat update', async () => {
    await controller.update('ri-1', { quantity: 300 });

    expect(service.update).toHaveBeenCalledWith('ri-1', { quantity: 300 });
  });

  it('memanggil remove dengan id string', async () => {
    await controller.remove('ri-1');

    expect(service.remove).toHaveBeenCalledWith('ri-1');
  });
});
