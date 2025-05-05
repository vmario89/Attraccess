import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, ClassSerializerInterceptor, Logger, LogLevel } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import { loadEnv } from '@attraccess/env';

const env = loadEnv((z) => ({
  AUTH_SESSION_SECRET: z.string(),
}));

export async function bootstrap() {
  const bootstrapLogger = new Logger('Bootstrap');
  bootstrapLogger.log('Starting bootstrap process...');

  const logLevels = (process.env.LOG_LEVELS || 'error,warn,log')
    .split(',')
    .filter((level): level is LogLevel => ['error', 'warn', 'log', 'debug', 'verbose'].includes(level));

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logLevels,
  });
  bootstrapLogger.log('Main application instance created.');

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();

  app.useWebSocketAdapter(new WsAdapter(app));

  app.use(
    session({
      secret: env.AUTH_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  bootstrapLogger.log(`🚀 Application is running with global prefix: ${globalPrefix}`);
  bootstrapLogger.log(`📝 Enabled log levels: ${logLevels.join(', ')}`);

  const configService = app.get(ConfigService);
  const storageCfg = configService.get('storage');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get('Reflector')));

  app.useStaticAssets(storageCfg.root, {
    prefix: '/storage',
    maxAge: 24 * 60 * 60 * 1000,
  });

  const config = new DocumentBuilder()
    .setTitle('Attraccess API')
    .setDescription('The Attraccess API used to manage machine and tool access in a Makerspace or FabLab')
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

  bootstrapLogger.log('Bootstrap process completed.');
  return { app, globalPrefix, swaggerDocumentFactory: documentFactory };
}
