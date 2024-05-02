import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import Bugsnag from '@bugsnag/js';
import {NestExpressApplication} from '@nestjs/platform-express';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // Can pass interface NestExpressApplication or NestFastifyApplication here if you want to access the underlying node framework api

  if (process.env.ENABLE_BUGSNAG === 'true') {
    console.log('>>> enabling bugsnag...');
    Bugsnag.start({
      apiKey: process.env.BUGSNAG_APIKEY,
      collectUserIp: false,
      releaseStage: process.env.BUGSNAG_RELEASE,
    });
  } else {
    console.log('bugsnag disabled');
  }

  if (process.env.ENV !== 'prod') {
    console.log('>>> DEV: enabling cors...');
    app.enableCors({
      origin: true,
      credentials: true
    });

    const config = new DocumentBuilder()
      .setTitle('chain-fi API')
      .setDescription('chain-fi')
      .setVersion('0.1')
      .addTag('chain-fi')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);
  }

  await app.listen(3000);
}

bootstrap();
