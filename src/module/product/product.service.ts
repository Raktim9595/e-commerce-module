import { Injectable, NotFoundException } from "@nestjs/common";
import { productRepository } from "./product.repository";
import { plainToInstance } from "class-transformer";
import { ProductResponseDto } from "./dto";

@Injectable()
export class ProductService {
    constructor(
        private readonly productRepositiry: productRepository
    ) { }

    async findAll() {
        return this.productRepositiry.findAll();
    }


    async findById(id: string): Promise<ProductResponseDto> {
        const product = await this.productRepositiry.findById(id);
        return plainToInstance(ProductResponseDto, product, {
            excludeExtraneousValues: true
        })
    }

    async updateStock(id: string, stock: number) {
        const product = await this.productRepositiry.findById(id);
        if (!product) {
            throw new NotFoundException("Product not found");
        }

        return this.productRepositiry.updateStock(id, product.stock - stock);
    }

    async getStockInfo() {
        return this.productRepositiry.getStockInfo();
    }
}