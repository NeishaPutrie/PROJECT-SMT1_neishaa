import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Smart Pantry API')
    .setDescription(
      'API untuk aplikasi resep & stok dapur anti food waste. ' +
        'Mengelola katalog bahan, resep, stok dapur per user, catatan food waste, ' +
        'serta fitur rekomendasi resep dan pengingat bahan mendekati kadaluarsa.',
    )
    .setVersion('1.0')
    .addTag('fixtures', 'Data contoh untuk demo dan pengujian')
    .addTag('users', 'Data pengguna')
    .addTag('ingredients', 'Katalog bahan makanan')
    .addTag('recipes', 'Resep masakan')
    .addTag('recipe-ingredients', 'Relasi bahan pada resep')
    .addTag('pantry-items', 'Stok dapur milik user')
    .addTag('waste-logs', 'Catatan bahan yang terbuang')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
