import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ConfigurationInterface } from './config/configuration.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Tiande API')
    .setDescription('api services for tiande')
    .setVersion('1.0')
    .addTag('Seller')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/', app, document);

  await app.listen(app.get(ConfigService).get('port'));
}
bootstrap();
