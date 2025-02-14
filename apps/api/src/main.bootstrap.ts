import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  Logger,
  LogLevel,
} from '@nestjs/common';

export async function bootstrap() {
  // Parse log levels from environment variable
  const logLevels = (process.env.LOG_LEVELS || 'error,warn,log')
    .split(',')
    .filter((level): level is LogLevel =>
      ['error', 'warn', 'log', 'debug', 'verbose'].includes(level)
    );

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Application is running with global prefix: ${globalPrefix}`);
  logger.log(`📝 Enabled log levels: ${logLevels.join(', ')}`);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  // Add global interceptor to handle @Exclude() decorators
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get('Reflector'))
  );

  const config = new DocumentBuilder()
    .setTitle('Attraccess API')
    .setDescription(
      'The Attraccess API used to manage machine and tool access in a Makerspace or FabLab'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({
      type: 'apiKey',
      in: 'header',
      name: 'x-api-key',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  return { app, globalPrefix, swaggerDocumentFactory: documentFactory };
}

bootstrap();
