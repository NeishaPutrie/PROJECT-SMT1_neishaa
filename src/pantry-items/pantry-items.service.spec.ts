import { describe, expect, it, vi } from 'vitest';
import type { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PantryItemsService } from './pantry-items.service.js';
import { PantryItem } from './entities/pantry-item.entity.js';

function createRepositoryMock() {
  const repo = {
    create: vi.fn<(input: Partial<PantryItem>) => Partial<PantryItem>>(
      (input) => input,
    ),
    save: vi.fn<(input: Partial<PantryItem>) => Promise<PantryItem>>(
      async (input) => ({ id: 'p-1', ...input }) as PantryItem,
    ),
    find: vi.fn<() => Promise<PantryItem[]>>(async () => []),
    findOne: vi.fn<() => Promise<PantryItem | null>>(async () => null),
    remove: vi.fn<(input: PantryItem) => Promise<PantryItem>>(
      async (input) => input,
    ),
  };
  return repo as unknown as Repository<PantryItem> & typeof repo;
}

/**
 * Bikin tanggal 'YYYY-MM-DD' sejumlah hari dari hari ini, supaya test
 * tidak bergantung pada tanggal tertentu.
 */
function dateFromToday(offsetDays: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function item(
  id: string,
  ingredientId: string,
  name: string,
  expiresAt: string | null,
  quantity = 100,
): PantryItem {
  return {
    id,
    ingredientId,
    quantity,
    unit: 'gram',
    expiresAt,
    ingredient: { name, unit: 'gram' },
  } as unknown as PantryItem;
}

describe('PantryItemsService', () => {
  it('menambah item stok', async () => {
    const repo = createRepositoryMock();
    const service = new PantryItemsService(repo);

    const result = await service.create({
      userId: 'u-1',
      ingredientId: 'i-1',
      quantity: 500,
    });

    expect(repo.save).toHaveBeenCalledOnce();
    expect(result.id).toBe('p-1');
  });

  it('mengambil semua stok urut tanggal kadaluarsa', async () => {
    const repo = createRepositoryMock();
    const service = new PantryItemsService(repo);

    await service.findAll();

    expect(repo.find).toHaveBeenCalledWith({
      relations: { ingredient: true, user: true },
      order: { expiresAt: 'ASC' },
    });
  });

  it('melempar NotFoundException kalau item tidak ada', async () => {
    const service = new PantryItemsService(createRepositoryMock());

    await expect(service.findOne('tidak-ada')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('mengubah jumlah stok', async () => {
    const repo = createRepositoryMock();
    repo.findOne.mockResolvedValue({ id: 'p-1', quantity: 100 } as PantryItem);
    const service = new PantryItemsService(repo);

    const result = await service.update('p-1', { quantity: 250 });

    expect(result.quantity).toBe(250);
  });

  it('menghapus item stok', async () => {
    const repo = createRepositoryMock();
    repo.findOne.mockResolvedValue({ id: 'p-1' } as PantryItem);
    const service = new PantryItemsService(repo);

    const result = await service.remove('p-1');

    expect(repo.remove).toHaveBeenCalledOnce();
    expect(result.message).toContain('p-1');
  });

  describe('findExpiring', () => {
    it('mengembalikan array kosong kalau tidak ada stok', async () => {
      const service = new PantryItemsService(createRepositoryMock());

      expect(await service.findExpiring('u-1', 3)).toEqual([]);
    });

    it('menghitung daysLeft dan status untuk bahan mendekati kadaluarsa', async () => {
      const repo = createRepositoryMock();
      repo.find.mockResolvedValue([
        item('p-1', 'i-1', 'Tomat', dateFromToday(2)),
        item('p-2', 'i-2', 'Bayam', dateFromToday(0)),
      ]);
      const service = new PantryItemsService(repo);

      const result = await service.findExpiring('u-1', 3);

      expect(result).toHaveLength(2);
      const tomat = result.find((i) => i.ingredientName === 'Tomat');
      const bayam = result.find((i) => i.ingredientName === 'Bayam');
      expect(tomat?.daysLeft).toBe(2);
      expect(tomat?.status).toBe('expiring_soon');
      expect(bayam?.daysLeft).toBe(0);
    });

    it('menandai bahan yang sudah lewat sebagai expired', async () => {
      const repo = createRepositoryMock();
      repo.find.mockResolvedValue([item('p-1', 'i-1', 'Cabai', dateFromToday(-4))]);
      const service = new PantryItemsService(repo);

      const [result] = await service.findExpiring('u-1', 3);

      expect(result.status).toBe('expired');
      expect(result.daysLeft).toBe(-4);
    });

    it('mengeluarkan bahan yang kadaluarsanya masih jauh', async () => {
      const repo = createRepositoryMock();
      repo.find.mockResolvedValue([
        item('p-1', 'i-1', 'Kecap', dateFromToday(30)),
        item('p-2', 'i-2', 'Tomat', dateFromToday(1)),
      ]);
      const service = new PantryItemsService(repo);

      const result = await service.findExpiring('u-1', 3);

      expect(result.map((i) => i.ingredientName)).toEqual(['Tomat']);
    });

    it('mengabaikan bahan tanpa tanggal kadaluarsa', async () => {
      const repo = createRepositoryMock();
      repo.find.mockResolvedValue([
        item('p-1', 'i-1', 'Beras', null),
        item('p-2', 'i-2', 'Tomat', dateFromToday(1)),
      ]);
      const service = new PantryItemsService(repo);

      const result = await service.findExpiring('u-1', 3);

      expect(result.map((i) => i.ingredientName)).toEqual(['Tomat']);
    });

    it('mengurutkan dari yang paling cepat kadaluarsa', async () => {
      const repo = createRepositoryMock();
      repo.find.mockResolvedValue([
        item('p-1', 'i-1', 'Wortel', dateFromToday(3)),
        item('p-2', 'i-2', 'Cabai', dateFromToday(-1)),
        item('p-3', 'i-3', 'Tomat', dateFromToday(1)),
      ]);
      const service = new PantryItemsService(repo);

      const result = await service.findExpiring('u-1', 3);

      expect(result.map((i) => i.daysLeft)).toEqual([-1, 1, 3]);
    });

    it('menghormati batas hari yang diminta', async () => {
      const repo = createRepositoryMock();
      repo.find.mockResolvedValue([
        item('p-1', 'i-1', 'Wortel', dateFromToday(6)),
        item('p-2', 'i-2', 'Tomat', dateFromToday(1)),
      ]);
      const service = new PantryItemsService(repo);

      expect(await service.findExpiring('u-1', 3)).toHaveLength(1);
      expect(await service.findExpiring('u-1', 7)).toHaveLength(2);
    });
  });
});
