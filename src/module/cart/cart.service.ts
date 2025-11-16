import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { cartRepository } from "./cart.repository";
import { CreateCartDto } from "./dto";
import { ProductService } from "../product/product.service";
import { Types } from "mongoose";

@Injectable()
export class cartService {
    constructor(
        private readonly cartRepository: cartRepository,
        private readonly productService: ProductService,
    ) { }

    async addItem({
        productId,
        quantity,
        userId
    }: CreateCartDto) {
        await this.validate(quantity, productId);

        const currentCartItems = await this.getCurrentCartItems(userId);
        const filtered = currentCartItems.filter(item => item.product.toString() !== productId);


        const newMatching = {
            ...currentCartItems.find(item => item.product.toString() === productId),
            quantity,
            product: new Types.ObjectId(productId)
        }

        return this.cartRepository.updateCart(userId, [...filtered, newMatching]);
    }

    private async validate(quantity: number, productId: string) {
        if (quantity < 0) {
            throw new BadRequestException("Quantity must not be smaller than zero")
        }

        const product = await this.productService.findById(productId);
        if (!product || !product.isActive) {
            throw new NotFoundException('Product not found or not available');
        }

        if (product.stock < quantity) {
            throw new BadRequestException('Not enough stock');
        }
    }

    private async getCurrentCartItems(userId: string) {
        const cart = await this.cartRepository.findByUserId(userId);
        return cart?.items?.map(({ product, quantity }) => ({ product: product._id, quantity })) || [];
    }

    async findByUserAndId(id: string, userId: string) {
        return this.cartRepository.findByIdAndUserId(id, userId);
    }

    async clearCart(userId: string) {
        return this.cartRepository.clearCart(userId);
    }

    async findByUserId(userId: string) {
        return this.cartRepository.findByUserId(userId);
    }

    async findById(id: string) {
        return this.cartRepository.findById(id);
    }
}