import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WasteLogsController } from './waste-logs.controller.js';
import { WasteLogsService } from './waste-logs.service.js';

describe('WasteLogsController', () => {
  let controller: WasteLogsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      create: vi.fn(async (dto) => ({ id: 'w-1', ...dto })),
      findAll: vi.fn(async () => []),
      findOne: vi.fn(async (id) => ({ id })),
      update: vi.fn(async (id, dto) => ({ id, ...dto })),
      remove: vi.fn(async (id) => ({ message: `Catatan ${id} dihapus` })),
    };
    controller = new WasteLogsController(
      service as unknown as WasteLogsService,
    );
  });

  it('meneruskan dto saat create', async () => {
    const dto = { userId: 'u-1', ingredientId: 'i-1', quantity: 50 };

    await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('meneruskan id string ke findOne', async () => {
    await controller.findOne('w-1');

    expect(service.findOne).toHaveBeenCalledWith('w-1');
  });

  it('meneruskan id dan dto saat update', async () => {
    await controller.update('w-1', { quantity: 80 });

    expect(service.update).toHaveBeenCalledWith('w-1', { quantity: 80 });
  });

  it('memanggil remove dengan id string', async () => {
    await controller.remove('w-1');

    expect(service.remove).toHaveBeenCalledWith('w-1');
  });
});
