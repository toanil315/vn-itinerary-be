import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

function bootstrapSwagger(app: INestApplication) {
  const documentFactory = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('VietNam Itinerary API')
      .setDescription('The VietNam Itinerary API description')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('api', app, cleanupOpenApiDoc(documentFactory));
}

async function startApplication(app: INestApplication) {
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT', 3000);
  const environment = configService.getOrThrow<string>(
    'NODE_ENV',
    'development',
  );

  const logger = new Logger();

  app.enableCors({
    allowedHeaders: ['content-type', 'authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: ['http://localhost:3000', 'http://138.199.156.120:3000', 'http://localhost:5173'],
    credentials: true,
  });

  await app.listen(port);

  logger.log(`VietNam Itinerary Backend started successfully`, 'Bootstrap', {
    port,
    environment,
  });
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  bootstrapSwagger(app);
  await startApplication(app);
}

bootstrap();
