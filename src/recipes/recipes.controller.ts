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
import { RecipesService } from './recipes.service.js';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah resep baru' })
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua resep beserta bahannya' })
  findAll() {
    return this.recipesService.findAll();
  }

  @Get('recommendations/:userId')
  @ApiOperation({
    summary:
      'Rekomendasi resep berdasarkan stok dapur user (diurutkan: bisa dimasak dulu)',
  })
  findRecommendations(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.recipesService.findRecommendations(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil satu resep berdasarkan id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Ubah data resep' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus resep' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.recipesService.remove(id);
  }
}
