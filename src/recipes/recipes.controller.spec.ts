import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecipesController } from './recipes.controller.js';
import { RecipesService } from './recipes.service.js';

describe('RecipesController', () => {
  let controller: RecipesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    findRecommendations: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      create: vi.fn(async (dto) => ({ id: 'r-1', ...dto })),
      findAll: vi.fn(async () => []),
      findOne: vi.fn(async (id) => ({ id })),
      findRecommendations: vi.fn(async () => []),
      update: vi.fn(async (id, dto) => ({ id, ...dto })),
      remove: vi.fn(async (id) => ({ message: `Resep ${id} dihapus` })),
    };
    controller = new RecipesController(service as unknown as RecipesService);
  });

  it('meneruskan dto saat create', async () => {
    const dto = { title: 'Nasi Goreng', instructions: '1. Masak' };

    await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('meneruskan userId ke findRecommendations', async () => {
    const userId = '6f2b1c9e-1111-4222-8333-444455556666';

    await controller.findRecommendations(userId);

    expect(service.findRecommendations).toHaveBeenCalledWith(userId);
  });

  it('meneruskan id string ke findOne', async () => {
    await controller.findOne('r-1');

    expect(service.findOne).toHaveBeenCalledWith('r-1');
  });

  it('meneruskan id dan dto saat update', async () => {
    await controller.update('r-1', { title: 'Baru' });

    expect(service.update).toHaveBeenCalledWith('r-1', { title: 'Baru' });
  });

  it('memanggil remove dengan id string', async () => {
    await controller.remove('r-1');

    expect(service.remove).toHaveBeenCalledWith('r-1');
  });
});
