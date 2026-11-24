import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Ingredient } from '../ingredients/entities/ingredient.entity.js';
import { Recipe } from '../recipes/entities/recipe.entity.js';
import { RecipeIngredient } from '../recipe-ingredients/entities/recipe-ingredient.entity.js';
import { PantryItem } from '../pantry-items/entities/pantry-item.entity.js';
import { WasteLog } from '../waste-logs/entities/waste-log.entity.js';

/**
 * Tanggal lokal (YYYY-MM-DD) sejumlah hari dari hari ini.
 * Sengaja tidak memakai toISOString() supaya tidak bergeser sehari
 * di zona waktu seperti WIB (UTC+7).
 */
function daysFromNow(days: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

@Injectable()
export class FixturesService {
  private readonly logger = new Logger(FixturesService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Ingredient)
    private readonly ingredientsRepository: Repository<Ingredient>,
    @InjectRepository(Recipe)
    private readonly recipesRepository: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientsRepository: Repository<RecipeIngredient>,
    @InjectRepository(PantryItem)
    private readonly pantryItemsRepository: Repository<PantryItem>,
    @InjectRepository(WasteLog)
    private readonly wasteLogsRepository: Repository<WasteLog>,
  ) {}

  async seed(): Promise<{ message: string; userId?: string }> {
    const existingUsers = await this.usersRepository.count();
    if (existingUsers > 0) {
      const first = await this.usersRepository.findOne({
        where: {},
        order: { createdAt: 'ASC' },
      });
      return {
        message:
          'Data contoh sudah ada, tidak ditambahkan lagi. Hapus dulu datanya kalau ingin isi ulang.',
        userId: first?.id,
      };
    }

    const user = await this.usersRepository.save(
      this.usersRepository.create({
        email: 'neisha@example.com',
        name: 'Neisha Putrie',
        password: 'rahasia123',
      }),
    );

    const ingredientSeeds = [
      { name: 'Beras', category: 'Biji-bijian', unit: 'gram' },
      { name: 'Mie Telur', category: 'Biji-bijian', unit: 'gram' },
      { name: 'Telur Ayam', category: 'Protein', unit: 'butir' },
      { name: 'Ayam Fillet', category: 'Protein', unit: 'gram' },
      { name: 'Tahu', category: 'Protein', unit: 'gram' },
      { name: 'Tempe', category: 'Protein', unit: 'gram' },
      { name: 'Bayam', category: 'Sayuran', unit: 'gram' },
      { name: 'Tomat', category: 'Sayuran', unit: 'gram' },
      { name: 'Wortel', category: 'Sayuran', unit: 'gram' },
      { name: 'Bawang Merah', category: 'Bumbu', unit: 'gram' },
      { name: 'Bawang Putih', category: 'Bumbu', unit: 'gram' },
      { name: 'Cabai Merah', category: 'Bumbu', unit: 'gram' },
      { name: 'Kecap Manis', category: 'Bumbu', unit: 'ml' },
      { name: 'Minyak Goreng', category: 'Minyak & Lemak', unit: 'ml' },
    ];

    const ingredients = await this.ingredientsRepository.save(
      ingredientSeeds.map((seed) => this.ingredientsRepository.create(seed)),
    );

    const byName = new Map(ingredients.map((item) => [item.name, item]));
    const pick = (name: string): Ingredient => {
      const ingredient = byName.get(name);
      if (!ingredient) {
        throw new Error(`Bahan ${name} tidak ada di daftar seed`);
      }
      return ingredient;
    };

    const recipeSeeds: Array<{
      title: string;
      description: string;
      instructions: string;
      servings: number;
      items: Array<{ name: string; quantity: number }>;
    }> = [
      {
        title: 'Nasi Goreng Sederhana',
        description: 'Nasi goreng rumahan untuk sarapan cepat.',
        instructions:
          '1. Haluskan bawang merah, bawang putih, dan cabai.\n2. Tumis bumbu dengan minyak sampai harum.\n3. Masukkan telur, orak-arik.\n4. Masukkan nasi, aduk rata.\n5. Tambahkan kecap manis, aduk dan sajikan.',
        servings: 2,
        items: [
          { name: 'Beras', quantity: 300 },
          { name: 'Telur Ayam', quantity: 2 },
          { name: 'Bawang Merah', quantity: 30 },
          { name: 'Bawang Putih', quantity: 15 },
          { name: 'Cabai Merah', quantity: 20 },
          { name: 'Kecap Manis', quantity: 30 },
          { name: 'Minyak Goreng', quantity: 30 },
        ],
      },
      {
        title: 'Tumis Bayam Tempe',
        description: 'Tumis sayur sederhana yang cepat matang.',
        instructions:
          '1. Iris tempe, goreng setengah matang.\n2. Tumis bawang putih dan bawang merah.\n3. Masukkan bayam, aduk sebentar.\n4. Tambahkan tempe, aduk rata, sajikan.',
        servings: 2,
        items: [
          { name: 'Bayam', quantity: 200 },
          { name: 'Tempe', quantity: 150 },
          { name: 'Bawang Merah', quantity: 20 },
          { name: 'Bawang Putih', quantity: 10 },
          { name: 'Minyak Goreng', quantity: 20 },
        ],
      },
      {
        title: 'Ayam Kecap',
        description: 'Ayam manis gurih dengan kecap, cocok dengan nasi hangat.',
        instructions:
          '1. Tumis bawang merah dan bawang putih.\n2. Masukkan ayam, masak sampai berubah warna.\n3. Tuang kecap manis dan sedikit air.\n4. Masak sampai bumbu meresap, sajikan.',
        servings: 3,
        items: [
          { name: 'Ayam Fillet', quantity: 400 },
          { name: 'Kecap Manis', quantity: 60 },
          { name: 'Bawang Merah', quantity: 30 },
          { name: 'Bawang Putih', quantity: 15 },
          { name: 'Minyak Goreng', quantity: 25 },
        ],
      },
      {
        title: 'Sup Wortel Tomat',
        description: 'Sup bening hangat untuk cuaca dingin.',
        instructions:
          '1. Didihkan air.\n2. Masukkan wortel dan tomat.\n3. Tumis bawang putih lalu masukkan ke sup.\n4. Masak sampai wortel empuk, sajikan.',
        servings: 2,
        items: [
          { name: 'Wortel', quantity: 200 },
          { name: 'Tomat', quantity: 150 },
          { name: 'Bawang Putih', quantity: 10 },
          { name: 'Minyak Goreng', quantity: 15 },
        ],
      },
      {
        title: 'Tahu Tempe Bacem',
        description: 'Tahu dan tempe manis gurih khas rumahan.',
        instructions:
          '1. Haluskan bawang merah dan bawang putih.\n2. Tumis bumbu, tambahkan kecap dan air.\n3. Masukkan tahu dan tempe.\n4. Masak sampai bumbu meresap.',
        servings: 3,
        items: [
          { name: 'Tahu', quantity: 200 },
          { name: 'Tempe', quantity: 200 },
          { name: 'Kecap Manis', quantity: 50 },
          { name: 'Bawang Merah', quantity: 25 },
          { name: 'Bawang Putih', quantity: 15 },
        ],
      },
    ];

    const savedRecipes: Recipe[] = [];
    for (const seed of recipeSeeds) {
      const recipe = await this.recipesRepository.save(
        this.recipesRepository.create({
          title: seed.title,
          description: seed.description,
          instructions: seed.instructions,
          servings: seed.servings,
        }),
      );
      savedRecipes.push(recipe);

      await this.recipeIngredientsRepository.save(
        seed.items.map((item) =>
          this.recipeIngredientsRepository.create({
            recipeId: recipe.id,
            ingredientId: pick(item.name).id,
            quantity: item.quantity,
          }),
        ),
      );
    }

    const pantrySeeds: Array<{
      name: string;
      quantity: number;
      unit: string;
      expiresAt?: string;
    }> = [
      { name: 'Beras', quantity: 2000, unit: 'gram' },
      { name: 'Mie Telur', quantity: 200, unit: 'gram' },
      { name: 'Telur Ayam', quantity: 6, unit: 'butir', expiresAt: daysFromNow(2) },
      { name: 'Ayam Fillet', quantity: 300, unit: 'gram', expiresAt: daysFromNow(1) },
      { name: 'Tahu', quantity: 150, unit: 'gram', expiresAt: daysFromNow(2) },
      { name: 'Tempe', quantity: 180, unit: 'gram', expiresAt: daysFromNow(1) },
      { name: 'Bayam', quantity: 150, unit: 'gram', expiresAt: daysFromNow(2) },
      { name: 'Tomat', quantity: 200, unit: 'gram', expiresAt: daysFromNow(4) },
      { name: 'Wortel', quantity: 250, unit: 'gram', expiresAt: daysFromNow(6) },
      { name: 'Bawang Merah', quantity: 200, unit: 'gram' },
      { name: 'Bawang Putih', quantity: 100, unit: 'gram' },
      { name: 'Cabai Merah', quantity: 50, unit: 'gram', expiresAt: daysFromNow(3) },
      { name: 'Kecap Manis', quantity: 275, unit: 'ml' },
      { name: 'Minyak Goreng', quantity: 500, unit: 'ml' },
    ];

    await this.pantryItemsRepository.save(
      pantrySeeds.map((seed) =>
        this.pantryItemsRepository.create({
          userId: user.id,
          ingredientId: pick(seed.name).id,
          quantity: seed.quantity,
          unit: seed.unit,
          expiresAt: seed.expiresAt,
        }),
      ),
    );

    await this.wasteLogsRepository.save([
      this.wasteLogsRepository.create({
        userId: user.id,
        ingredientId: pick('Tomat').id,
        quantity: 50,
        reason: 'Sebagian layu',
      }),
      this.wasteLogsRepository.create({
        userId: user.id,
        ingredientId: pick('Bayam').id,
        quantity: 30,
        reason: 'Daun menguning',
      }),
    ]);

    this.logger.log(
      `Data contoh dibuat: 1 user, ${ingredients.length} bahan, ${savedRecipes.length} resep, ${pantrySeeds.length} stok dapur.`,
    );

    return {
      message:
        'Data contoh berhasil dibuat. Pakai userId ini untuk mencoba endpoint rekomendasi dan expiring.',
      userId: user.id,
    };
  }
}
