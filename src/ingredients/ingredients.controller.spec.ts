import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IngredientsController } from './ingredients.controller.js';
import { IngredientsService } from './ingredients.service.js';

describe('IngredientsController', () => {
  let controller: IngredientsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      create: vi.fn(async (dto) => ({ id: 'i-1', ...dto })),
      findAll: vi.fn(async () => []),
      findOne: vi.fn(async (id) => ({ id })),
      update: vi.fn(async (id, dto) => ({ id, ...dto })),
      remove: vi.fn(async (id) => ({ message: `Bahan ${id} dihapus` })),
    };
    controller = new IngredientsController(
      service as unknown as IngredientsService,
    );
  });

  it('meneruskan dto saat create', async () => {
    const dto = { name: 'Beras', category: 'Biji-bijian', unit: 'gram' };

    await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('meneruskan id string ke findOne', async () => {
    await controller.findOne('i-1');

    expect(service.findOne).toHaveBeenCalledWith('i-1');
  });

  it('meneruskan id dan dto saat update', async () => {
    await controller.update('i-1', { name: 'Beras Merah' });

    expect(service.update).toHaveBeenCalledWith('i-1', { name: 'Beras Merah' });
  });

  it('memanggil remove dengan id string', async () => {
    await controller.remove('i-1');

    expect(service.remove).toHaveBeenCalledWith('i-1');
  });
});
