import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto.js';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto.js';
import { PantryItem } from './entities/pantry-item.entity.js';

export interface ExpiringPantryItem {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  expiresAt: string;
  daysLeft: number;
  status: 'expired' | 'expiring_soon';
}

/**
 * Ubah 'YYYY-MM-DD' menjadi Date pada tengah malam waktu lokal.
 * Dibuat manual supaya tidak bergeser sehari di zona waktu tertentu.
 */
function toLocalDate(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

function todayLocal(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

@Injectable()
export class PantryItemsService {
  constructor(
    @InjectRepository(PantryItem)
    private readonly pantryItemsRepository: Repository<PantryItem>,
  ) {}

  async create(createPantryItemDto: CreatePantryItemDto): Promise<PantryItem> {
    const pantryItem = this.pantryItemsRepository.create(createPantryItemDto);
    return this.pantryItemsRepository.save(pantryItem);
  }

  async findAll(): Promise<PantryItem[]> {
    return this.pantryItemsRepository.find({
      relations: { ingredient: true, user: true },
      order: { expiresAt: 'ASC' },
    });
  }

  async findExpiring(
    userId: string,
    days: number,
  ): Promise<ExpiringPantryItem[]> {
    const items = await this.pantryItemsRepository.find({
      where: { userId },
      relations: { ingredient: true },
      order: { expiresAt: 'ASC' },
    });

    const today = todayLocal();

    return items
      .filter((item) => item.expiresAt !== null && item.expiresAt !== undefined)
      .map((item) => {
        const daysLeft = Math.round(
          (toLocalDate(item.expiresAt).getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        return {
          id: item.id,
          ingredientId: item.ingredientId,
          ingredientName: item.ingredient?.name ?? 'Tidak diketahui',
          quantity: Number(item.quantity ?? 0),
          unit: item.unit ?? item.ingredient?.unit ?? '',
          expiresAt: item.expiresAt,
          daysLeft,
          status: daysLeft < 0 ? ('expired' as const) : ('expiring_soon' as const),
        };
      })
      .filter((item) => item.daysLeft <= days)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }

  async findOne(id: string): Promise<PantryItem> {
    const pantryItem = await this.pantryItemsRepository.findOne({
      where: { id },
      relations: { ingredient: true, user: true },
    });
    if (!pantryItem) {
      throw new NotFoundException(`PantryItem dengan id ${id} tidak ditemukan`);
    }
    return pantryItem;
  }

  async update(
    id: string,
    updatePantryItemDto: UpdatePantryItemDto,
  ): Promise<PantryItem> {
    const pantryItem = await this.findOne(id);
    Object.assign(pantryItem, updatePantryItemDto);
    return this.pantryItemsRepository.save(pantryItem);
  }

  async remove(id: string): Promise<{ message: string }> {
    const pantryItem = await this.findOne(id);
    await this.pantryItemsRepository.remove(pantryItem);
    return { message: `PantryItem dengan id ${id} berhasil dihapus` };
  }
}
