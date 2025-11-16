import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Cart, CartSchema } from "./model";
import { cartRepository } from "./cart.repository";
import { cartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { ProductModule } from "../product";

@Module({
    imports: [MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
        ProductModule
    ],
    providers: [cartRepository, cartService],
    controllers: [CartController],
    exports: [cartService]
})
export class CartModule { }