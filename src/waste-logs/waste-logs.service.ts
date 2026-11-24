import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWasteLogDto } from './dto/create-waste-log.dto.js';
import { UpdateWasteLogDto } from './dto/update-waste-log.dto.js';
import { WasteLog } from './entities/waste-log.entity.js';

@Injectable()
export class WasteLogsService {
  constructor(
    @InjectRepository(WasteLog)
    private readonly wasteLogsRepository: Repository<WasteLog>,
  ) {}

  async create(createWasteLogDto: CreateWasteLogDto): Promise<WasteLog> {
    const wasteLog = this.wasteLogsRepository.create(createWasteLogDto);
    return this.wasteLogsRepository.save(wasteLog);
  }

  async findAll(): Promise<WasteLog[]> {
    return this.wasteLogsRepository.find({
      relations: { ingredient: true, user: true },
      order: { loggedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<WasteLog> {
    const wasteLog = await this.wasteLogsRepository.findOne({
      where: { id },
      relations: { ingredient: true, user: true },
    });
    if (!wasteLog) {
      throw new NotFoundException(`WasteLog dengan id ${id} tidak ditemukan`);
    }
    return wasteLog;
  }

  async update(
    id: string,
    updateWasteLogDto: UpdateWasteLogDto,
  ): Promise<WasteLog> {
    const wasteLog = await this.findOne(id);
    Object.assign(wasteLog, updateWasteLogDto);
    return this.wasteLogsRepository.save(wasteLog);
  }

  async remove(id: string): Promise<{ message: string }> {
    const wasteLog = await this.findOne(id);
    await this.wasteLogsRepository.remove(wasteLog);
    return { message: `WasteLog dengan id ${id} berhasil dihapus` };
  }
}
