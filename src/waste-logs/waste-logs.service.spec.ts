import { describe, expect, it, vi } from 'vitest';
import type { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { WasteLogsService } from './waste-logs.service.js';
import { WasteLog } from './entities/waste-log.entity.js';

function createRepositoryMock() {
  const repo = {
    create: vi.fn<(input: Partial<WasteLog>) => Partial<WasteLog>>(
      (input) => input,
    ),
    save: vi.fn<(input: Partial<WasteLog>) => Promise<WasteLog>>(
      async (input) => ({ id: 'w-1', ...input }) as WasteLog,
    ),
    find: vi.fn<() => Promise<WasteLog[]>>(async () => []),
    findOne: vi.fn<() => Promise<WasteLog | null>>(async () => null),
    remove: vi.fn<(input: WasteLog) => Promise<WasteLog>>(
      async (input) => input,
    ),
  };
  return repo as unknown as Repository<WasteLog> & typeof repo;
}

describe('WasteLogsService', () => {
  it('mencatat bahan yang terbuang', async () => {
    const repo = createRepositoryMock();
    const service = new WasteLogsService(repo);

    const result = await service.create({
      userId: 'u-1',
      ingredientId: 'i-1',
      quantity: 50,
      reason: 'Layu',
    });

    expect(result.id).toBe('w-1');
    expect(repo.save).toHaveBeenCalledOnce();
  });

  it('mengambil semua catatan urut waktu terbaru', async () => {
    const repo = createRepositoryMock();
    const service = new WasteLogsService(repo);

    await service.findAll();

    expect(repo.find).toHaveBeenCalledWith({
      relations: { ingredient: true, user: true },
      order: { loggedAt: 'DESC' },
    });
  });

  it('melempar NotFoundException kalau catatan tidak ada', async () => {
    const service = new WasteLogsService(createRepositoryMock());

    await expect(service.findOne('tidak-ada')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('mengubah catatan', async () => {
    const repo = createRepositoryMock();
    repo.findOne.mockResolvedValue({ id: 'w-1', quantity: 50 } as WasteLog);
    const service = new WasteLogsService(repo);

    const result = await service.update('w-1', { quantity: 80 });

    expect(result.quantity).toBe(80);
  });

  it('menghapus catatan', async () => {
    const repo = createRepositoryMock();
    repo.findOne.mockResolvedValue({ id: 'w-1' } as WasteLog);
    const service = new WasteLogsService(repo);

    const result = await service.remove('w-1');

    expect(repo.remove).toHaveBeenCalledOnce();
    expect(result.message).toContain('w-1');
  });
});
