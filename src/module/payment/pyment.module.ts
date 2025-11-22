import { Module } from "@nestjs/common";
import { StripeModule } from "../stripe";
import { OrderModule } from "../order";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { ProductModule } from "../product";

@Module({
    imports: [StripeModule, OrderModule, ProductModule],
    providers: [PaymentService],
    controllers: [PaymentController]
})
export class PaymentModule { }