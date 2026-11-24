import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PantryItemsController } from './pantry-items.controller.js';
import { PantryItemsService } from './pantry-items.service.js';

describe('PantryItemsController', () => {
  let controller: PantryItemsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    findExpiring: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      create: vi.fn(async (dto) => ({ id: 'p-1', ...dto })),
      findAll: vi.fn(async () => []),
      findOne: vi.fn(async (id) => ({ id })),
      findExpiring: vi.fn(async () => []),
      update: vi.fn(async (id, dto) => ({ id, ...dto })),
      remove: vi.fn(async (id) => ({ message: `Stok ${id} dihapus` })),
    };
    controller = new PantryItemsController(
      service as unknown as PantryItemsService,
    );
  });

  it('meneruskan dto saat create', async () => {
    const dto = { userId: 'u-1', ingredientId: 'i-1', quantity: 500 };

    await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('memakai 3 hari sebagai default kalau query days kosong', async () => {
    await controller.findExpiring('u-1', undefined);

    expect(service.findExpiring).toHaveBeenCalledWith('u-1', 3);
  });

  it('memakai nilai days dari query kalau diisi', async () => {
    await controller.findExpiring('u-1', 7);

    expect(service.findExpiring).toHaveBeenCalledWith('u-1', 7);
  });

  it('meneruskan id string ke findOne', async () => {
    await controller.findOne('p-1');

    expect(service.findOne).toHaveBeenCalledWith('p-1');
  });

  it('meneruskan id dan dto saat update', async () => {
    await controller.update('p-1', { quantity: 250 });

    expect(service.update).toHaveBeenCalledWith('p-1', { quantity: 250 });
  });

  it('memanggil remove dengan id string', async () => {
    await controller.remove('p-1');

    expect(service.remove).toHaveBeenCalledWith('p-1');
  });
});
