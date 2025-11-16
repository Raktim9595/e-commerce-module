import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter, ResponseInterceptor, swaggerConfig } from './utils';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip unknown properties
      forbidNonWhitelisted: false, // Throw error if unknown props exist
      transform: true,          // Automatically transform types (e.g. id as string)
      transformOptions: {
        enableImplicitConversion: true, // allow auto-conversion in DTOs
      },
    }),
  );


  // Swagger setup 
  const swaggerDoc = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, swaggerDoc);


  // Response interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // register global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter())

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
