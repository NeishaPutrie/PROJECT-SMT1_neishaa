import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PantryItemsService } from './pantry-items.service.js';
import { PantryItemsController } from './pantry-items.controller.js';
import { PantryItem } from './entities/pantry-item.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([PantryItem])],
  controllers: [PantryItemsController],
  providers: [PantryItemsService],
})
export class PantryItemsModule {}
