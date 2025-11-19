import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Cart, CartSchema } from "./model";
import { CartRepository } from "./cart.repository";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { ProductModule } from "../product";

@Module({
    imports: [MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
        ProductModule
    ],
    providers: [CartRepository, CartService],
    controllers: [CartController],
    exports: [CartService]
})
export class CartModule { }