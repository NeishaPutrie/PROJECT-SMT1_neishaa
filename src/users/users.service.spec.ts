import { describe, expect, it, vi } from 'vitest';
import type { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';

function createRepositoryMock() {
  const repo = {
    create: vi.fn<(input: Partial<User>) => Partial<User>>((input) => input),
    save: vi.fn<(input: Partial<User>) => Promise<User>>(
      async (input) => ({ id: 'u-1', ...input }) as User,
    ),
    find: vi.fn<() => Promise<User[]>>(async () => []),
    findOne: vi.fn<() => Promise<User | null>>(async () => null),
    remove: vi.fn<(input: User) => Promise<User>>(async (input) => input),
  };
  return repo as unknown as Repository<User> & typeof repo;
}

describe('UsersService', () => {
  it('membuat user baru', async () => {
    const repo = createRepositoryMock();
    const service = new UsersService(repo);

    const result = await service.create({
      email: 'a@example.com',
      name: 'Neisha',
      password: 'rahasia123',
    });

    expect(repo.save).toHaveBeenCalledOnce();
    expect(result.email).toBe('a@example.com');
  });

  it('mengembalikan semua user', async () => {
    const repo = createRepositoryMock();
    repo.find.mockResolvedValue([{ id: 'u-1' } as User]);
    const service = new UsersService(repo);

    expect(await service.findAll()).toHaveLength(1);
    expect(repo.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
  });

  it('melempar NotFoundException kalau user tidak ada', async () => {
    const repo = createRepositoryMock();
    const service = new UsersService(repo);

    await expect(service.findOne('tidak-ada')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('mengubah data user yang ada', async () => {
    const repo = createRepositoryMock();
    repo.findOne.mockResolvedValue({ id: 'u-1', name: 'Lama' } as User);
    const service = new UsersService(repo);

    const result = await service.update('u-1', { name: 'Baru' });

    expect(result.name).toBe('Baru');
    expect(repo.save).toHaveBeenCalledOnce();
  });

  it('menghapus user dan mengembalikan pesan', async () => {
    const repo = createRepositoryMock();
    repo.findOne.mockResolvedValue({ id: 'u-1' } as User);
    const service = new UsersService(repo);

    const result = await service.remove('u-1');

    expect(repo.remove).toHaveBeenCalledOnce();
    expect(result.message).toContain('u-1');
  });
});
