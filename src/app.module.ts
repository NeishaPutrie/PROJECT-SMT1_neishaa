 import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { IngredientsModule } from './ingredients/ingredients.module.js';
import { RecipesModule } from './recipes/recipes.module.js';
import { RecipeIngredientsModule } from './recipe-ingredients/recipe-ingredients.module.js';
import { PantryItemsModule } from './pantry-items/pantry-items.module.js';
import { WasteLogsModule } from './waste-logs/waste-logs.module.js';
import { FixturesModule } from './fixtures/fixtures.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        ssl: { rejectUnauthorized: false },
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UsersModule,
    IngredientsModule,
    RecipesModule,
    RecipeIngredientsModule,
    PantryItemsModule,
    WasteLogsModule,
    FixturesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
