import { PartialType } from '@nestjs/swagger';
import { CreateWasteLogDto } from './create-waste-log.dto.js';

export class UpdateWasteLogDto extends PartialType(CreateWasteLogDto) {}
