import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WasteLogsService } from './waste-logs.service.js';
import { WasteLogsController } from './waste-logs.controller.js';
import { WasteLog } from './entities/waste-log.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([WasteLog])],
  controllers: [WasteLogsController],
  providers: [WasteLogsService],
})
export class WasteLogsModule {}
