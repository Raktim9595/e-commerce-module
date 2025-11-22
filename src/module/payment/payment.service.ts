import { BadRequestException, Injectable } from "@nestjs/common";
import { StripeService } from "../stripe";
import { Order, OrderService, OrderStatus, PaymentStatus } from "../order";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProductService } from "../product/product.service";

@Injectable()
export class PaymentService {
    constructor(
        private readonly stripeService: StripeService,
        private readonly orderService: OrderService,
        private readonly configService: ConfigService,
        private readonly productService: ProductService
    ) { }

    async handleWebHook(body: any, signature: string,) {
        const stripe = this.stripeService.client;
        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                webhookSecret ?? "",
            );
        } catch (err) {
            throw new BadRequestException("Invalid Signature")
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const orderId = session.metadata?.orderId;

            if (orderId) {
                const order = await this.orderService.findById(orderId);
                if (order) {

                    // update the stock after the order is completed
                    const updateStockPromises = order!.items.map((item) => {
                        return this.productService.updateStock(item.productId.toString(), item.quantity)
                    })


                    await Promise.all([
                        this.orderService.completeOrder(orderId),
                        ...updateStockPromises])
                    console.log('✅ Order marked as PAID:', orderId);
                }
            }
        }

        return { received: true };
    }
}