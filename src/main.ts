import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as proxy from 'express-http-proxy';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filter';
// import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: process.env.FE_URL,
    credentials: true,
  });

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

  const port = parseInt(process.env.PORT);
  const host = process.env.HOST || 'localhost';

  await app.listen(port, host);
  console.log(`server running at ${host}:${port}`);
}
bootstrap();
