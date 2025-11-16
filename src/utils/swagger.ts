import { DocumentBuilder } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder().setTitle("E-COMMERCE API").setVersion("1.0").build();
