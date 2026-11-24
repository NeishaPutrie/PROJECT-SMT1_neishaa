import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PantryItemsService } from './pantry-items.service.js';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto.js';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto.js';

@ApiTags('pantry-items')
@Controller('pantry-items')
export class PantryItemsController {
  constructor(private readonly pantryItemsService: PantryItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah stok bahan ke dapur user' })
  create(@Body() createPantryItemDto: CreatePantryItemDto) {
    return this.pantryItemsService.create(createPantryItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua stok dapur' })
  findAll() {
    return this.pantryItemsService.findAll();
  }

  @Get('expiring/:userId')
  @ApiOperation({
    summary: 'Daftar stok yang mendekati kadaluarsa (default 3 hari)',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    example: 3,
    description: 'Batas jumlah hari ke depan',
  })
  findExpiring(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    return this.pantryItemsService.findExpiring(userId, days ?? 3);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil satu item stok berdasarkan id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pantryItemsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Ubah jumlah atau tanggal kadaluarsa stok' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePantryItemDto: UpdatePantryItemDto,
  ) {
    return this.pantryItemsService.update(id, updatePantryItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus item stok' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pantryItemsService.remove(id);
  }
}
