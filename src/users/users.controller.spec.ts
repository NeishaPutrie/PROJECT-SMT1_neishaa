import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let controller: UsersController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      create: vi.fn(async (dto) => ({ id: 'u-1', ...dto })),
      findAll: vi.fn(async () => []),
      findOne: vi.fn(async (id) => ({ id })),
      update: vi.fn(async (id, dto) => ({ id, ...dto })),
      remove: vi.fn(async (id) => ({ message: `User dengan id ${id} dihapus` })),
    };
    controller = new UsersController(service as unknown as UsersService);
  });

  it('meneruskan dto ke service saat create', async () => {
    const dto = { email: 'a@example.com', name: 'Neisha', password: 'rahasia123' };

    await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('meneruskan id bertipe string (UUID) ke service', async () => {
    const id = '6f2b1c9e-1111-4222-8333-444455556666';

    await controller.findOne(id);

    expect(service.findOne).toHaveBeenCalledWith(id);
  });

  it('meneruskan id dan dto saat update', async () => {
    const id = '6f2b1c9e-1111-4222-8333-444455556666';

    await controller.update(id, { name: 'Baru' });

    expect(service.update).toHaveBeenCalledWith(id, { name: 'Baru' });
  });

  it('memanggil remove dengan id yang sama', async () => {
    const id = '6f2b1c9e-1111-4222-8333-444455556666';

    await controller.remove(id);

    expect(service.remove).toHaveBeenCalledWith(id);
  });
});
