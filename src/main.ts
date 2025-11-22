import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as proxy from 'express-http-proxy';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.getOrThrow<string>('FE_URL'),
    credentials: true,
  });

  const appPrefix = configService.getOrThrow('PREFIX');

  app.setGlobalPrefix(appPrefix);

  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.use(
    '/unsplash-proxy',
    proxy('https://api.unsplash.com', {
      proxyReqPathResolver: (request) => {
        const parts = request.url.split('?');
        return (
          `${parts[0]}?client_id=${process.env.UNSPLASH_ACCESS_KEY}` +
          (parts.length ? `&${parts[1]}` : '')
        );
      },
    }),
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.useGlobalFilters(new AllExceptionsFilter());

  const port = parseInt(configService.getOrThrow<string>('PORT'), 10);
  const host = configService.getOrThrow('HOST') || 'localhost';

  await app.listen(port, host);
  console.log(`server running at ${host}:${port}`);
}
bootstrap();
