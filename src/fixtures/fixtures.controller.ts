import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FixturesService } from './fixtures.service.js';

@ApiTags('fixtures')
@Controller('fixtures')
export class FixturesController {
  constructor(private readonly fixturesService: FixturesService) {}

  @Post('seed')
  @ApiOperation({
    summary: 'Isi database dengan data contoh (1 user, bahan, resep, stok dapur)',
  })
  seed() {
    return this.fixturesService.seed();
  }
}
