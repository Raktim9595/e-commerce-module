import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OrderRepository } from "./order.repository";
import { cartService } from "../cart/cart.service";
import { OrderItem } from "./model";
import { Product } from "../product/model";
import { ProductService } from "../product/product.service";
import { CreateOrderDto } from "./dto";
import { UpdateWriteOpResult } from "mongoose";
import { Cart, CartItem } from "../cart/model";

@Injectable()
export class orderService {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly cartService: cartService,
        private readonly productService: ProductService
    ) { }

    async placeOrder({
        cartId,
        userId,
        shippingAddress,
        notes
    }: CreateOrderDto) {
        const cart = await this.findCartAndValidate(cartId, userId);

        const { updateStockPromises, ...rest } = await this.prepareOrders(cart);

        const createoOrderPromise = this.orderRepository.createOrder({
            ...rest,
            userId,
            shippingAddress,
            notes
        });
        const clearCartPromise = this.cartService.clearCart(userId);

        const [createdOrder] = await Promise.all([createoOrderPromise, clearCartPromise, ...updateStockPromises]);
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
        let updateStockPromises: Promise<UpdateWriteOpResult>[] = [];

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
            updateStockPromises.push(this.productService.updateStock(item.product.id.toString(), product.stock - item.quantity))
        }

        const totalAmount = orderItems.reduce((acc, item) => acc + item.lineTotal, 0);

        return {
            items: orderItems,
            totalAmount,
            updateStockPromises
        }
    }

    async findByUserId(userId: string) {
        return this.orderRepository.findByUserId(userId);
    }

    async findById(id: string) {
        return this.orderRepository.findById(id);
    }
} 