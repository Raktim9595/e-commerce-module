import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OrderRepository } from "./order.repository";
import { CartService } from "../cart/cart.service";
import { Order, OrderItem, OrderStatus, PaymentProvider, PaymentStatus } from "./model";
import { Product } from "../product/model";
import { CreateOrderDto, OrderConfirmationDto } from "./dto";
import { Model } from "mongoose";
import { Cart } from "../cart/model";
import { StripeService } from "../stripe";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class OrderService {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly cartService: CartService,
        private readonly stripeService: StripeService,
        @InjectModel(Order.name) private readonly orderModel: Model<Order>
    ) { }

    async placeOrder({
        cartId,
        userId,
        shippingAddress,
        notes
    }: CreateOrderDto) {
        const cart = await this.findCartAndValidate(cartId, userId);

        const preparedOrders = await this.prepareOrders(cart);

        const createoOrderPromise = this.orderRepository.createOrder({
            ...preparedOrders,
            userId,
            shippingAddress,
            notes
        });
        const clearCartPromise = this.cartService.clearCart(userId);

        const [createdOrder] = await Promise.all([createoOrderPromise, clearCartPromise]);
        return createdOrder;
    }

    private async findCartAndValidate(cartId: string, userId: string) {
        const cart = await this.cartService.findByUserAndId(cartId, userId);

        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Cart is empty');
        }
        return cart;
    }


    private async prepareOrders(cart: Cart) {
        let total = 0;
        let orderItems: OrderItem[] = [];

        for (const item of cart.items) {
            const product: Product = item.product as any as Product;

            if (!product || !product.isActive) {
                throw new NotFoundException(
                    `Product no longer available: ${item.product}`,
                );
            }

            if (product.stock < item.quantity) {
                throw new BadRequestException(
                    `Not enough stock for product: ${product.name}`,
                );
            }

            const lineTotal = product.price * item.quantity;
            total += lineTotal;

            orderItems.push({
                productId: item.product._id,
                productName: product.name,
                productBrand: product.brand,
                productType: product.type,
                quantity: item.quantity,
                pricePerUnit: product.price,
                lineTotal,
            });

            // Decrease the stock
            product.stock -= item.quantity;
        }

        const totalAmount = orderItems.reduce((acc, item) => acc + item.lineTotal, 0);

        return {
            items: orderItems,
            totalAmount
        }
    }

    async findByUserId(userId: string) {
        return this.orderRepository.findByUserId(userId);
    }

    async findById(id: string) {
        return this.orderRepository.findById(id);
    }

    // confirm order payment
    async confirmOrder(orderId: string, {
        userId
    }: OrderConfirmationDto) {
        const order = await this.orderRepository.findById(orderId);
        await this.validateOrder(order);

        const stripe = this.stripeService.client;

        const preparedItems = this.prepareOrderItemsToCheckout(order?.items ?? []);

        // stripe session
        const stripeSession = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: preparedItems,
            success_url: "http://localhost:8080/api",
            cancel_url: "http://localhost:8080/api",
            metadata: {
                orderId: order?._id.toString() ?? "",
                userId,
            }
        })

        // update payment status and many more for the order
        await this.updateOrderInfo(orderId, stripeSession.id);

        return {
            checkoutUrl: stripeSession.url
        }
    }

    private async updateOrderInfo(orderId: string, sessionId: string) {
        await this.orderModel.findByIdAndUpdate(orderId, {
            paymentStatus: PaymentStatus.PENDING,
            paymentReference: sessionId,
            paymentProvider: PaymentProvider.STRIPE,
            status: OrderStatus.PENDING_PAYMENT
        })
    }

    private prepareOrderItemsToCheckout(orderItems: OrderItem[]) {
        return orderItems.map((item) => ({
            price_data: {
                currency: 'aud',
                unit_amount: Math.round(item.pricePerUnit * 100), // Stripe uses cents
                product_data: {
                    name: item.productName,
                    metadata: {
                        productId: item.productId.toString(),
                        brand: item.productBrand,
                        type: item.productType,
                    },
                },
            },
            quantity: item.quantity,
        }));
    }


    private async validateOrder(order: Order | null) {
        if (!order) {
            throw new NotFoundException("Order not found");
        }

        if (order.paymentStatus === PaymentStatus.SUCCESS) {
            throw new BadRequestException("Order has already been paid");
        }

        if (!order.items.length) {
            throw new BadRequestException("No items in order to be paid")
        }
    }

    async completeOrder(orderId: string) {
        await this.orderModel.findByIdAndUpdate(orderId, {
            paymentStatus: PaymentStatus.SUCCESS,
            status: OrderStatus.PAID,
        })
    }
}