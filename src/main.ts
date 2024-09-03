import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FE_URL,
    credentials: true
  });

  const port = parseInt(process.env.PORT);
  const host = process.env.HOST || "localhost";

  app.use(cookieParser());
  await app.listen(port, host, () => {
    console.log(`server running at ${host}:${port}`);
  });
}
bootstrap();
