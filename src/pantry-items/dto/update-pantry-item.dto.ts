import { PartialType } from '@nestjs/swagger';
import { CreatePantryItemDto } from './create-pantry-item.dto.js';

export class UpdatePantryItemDto extends PartialType(CreatePantryItemDto) {}
