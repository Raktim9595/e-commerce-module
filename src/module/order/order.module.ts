import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "./model";
import { OrderRepository } from "./order.repository";
import { orderService } from "./order.service";
import { OrderController } from "./order.controller";
import { CartModule } from "../cart";
import { ProductModule } from "../product";
import { StripeModule } from "../stripe";

@Module({
    imports: [MongooseModule.forFeature([{
        name: Order.name, schema: OrderSchema,
    }]),
        CartModule,
        ProductModule,
        StripeModule,
    ],
    providers: [OrderRepository, orderService],
    controllers: [OrderController],
    exports: [orderService, OrderRepository]
})
export class OrderModule { }