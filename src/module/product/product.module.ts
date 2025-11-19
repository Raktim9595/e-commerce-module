import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProductController } from "./procut.controller";
import { ProductService } from "./product.service";
import { ProductRepository } from "./product.repository";
import { Product, ProductSchema } from "./model";
import { ProductSeedService } from "src/utils";

@Module({
    imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])],
    controllers: [ProductController],
    providers: [ProductService, ProductRepository, ProductSeedService],
    exports: [ProductService]
})
export class ProductModule { }