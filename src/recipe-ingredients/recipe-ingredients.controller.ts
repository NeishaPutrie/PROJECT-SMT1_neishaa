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
import { RecipeIngredientsService } from './recipe-ingredients.service.js';
import { CreateRecipeIngredientDto } from './dto/create-recipe-ingredient.dto.js';
import { UpdateRecipeIngredientDto } from './dto/update-recipe-ingredient.dto.js';

@ApiTags('recipe-ingredients')
@Controller('recipe-ingredients')
export class RecipeIngredientsController {
  constructor(
    private readonly recipeIngredientsService: RecipeIngredientsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Hubungkan satu bahan ke sebuah resep' })
  create(@Body() createRecipeIngredientDto: CreateRecipeIngredientDto) {
    return this.recipeIngredientsService.create(createRecipeIngredientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua relasi resep-bahan' })
  findAll() {
    return this.recipeIngredientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil satu relasi berdasarkan id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.recipeIngredientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Ubah jumlah bahan pada resep' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRecipeIngredientDto: UpdateRecipeIngredientDto,
  ) {
    return this.recipeIngredientsService.update(id, updateRecipeIngredientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus relasi resep-bahan' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.recipeIngredientsService.remove(id);
  }
}
