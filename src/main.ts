import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Telegram Group Analyzer API')
    .setDescription(
      'API for analyzing the last 7 days of messages in Telegram groups/supergroups. ' +
        'Identifies the most active discussion threads including reply chains and forum topics.',
    )
    .setVersion('1.0')
    .addTag('analyzer', 'Group message analysis endpoints')
    .setContact(
      'Sunnatullo Hayitov',
      'https://t.me/code_craft01',
      'sunnatullosun@gmail.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Telegram Analyzer API',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger API documentation: http://localhost:${port}/api`);
  logger.log(`📊 Analyze endpoint: POST http://localhost:${port}/analyze`);
}
bootstrap();
