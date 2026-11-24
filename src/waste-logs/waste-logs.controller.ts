import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WasteLogsService } from './waste-logs.service.js';
import { CreateWasteLogDto } from './dto/create-waste-log.dto.js';
import { UpdateWasteLogDto } from './dto/update-waste-log.dto.js';

@ApiTags('waste-logs')
@Controller('waste-logs')
export class WasteLogsController {
  constructor(private readonly wasteLogsService: WasteLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Catat bahan yang terbuang' })
  create(@Body() createWasteLogDto: CreateWasteLogDto) {
    return this.wasteLogsService.create(createWasteLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua catatan food waste' })
  findAll() {
    return this.wasteLogsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil satu catatan berdasarkan id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.wasteLogsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Ubah catatan food waste' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWasteLogDto: UpdateWasteLogDto,
  ) {
    return this.wasteLogsService.update(id, updateWasteLogDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus catatan food waste' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.wasteLogsService.remove(id);
  }
}
