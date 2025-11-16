import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProductController } from "./procut.controller";
import { ProductService } from "./product.service";
import { productRepository } from "./product.repository";
import { Product, ProductSchema } from "./model";

@Module({
    imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])],
    controllers: [ProductController],
    providers: [ProductService, productRepository],
    exports: [ProductService]
})
export class ProductModule { }