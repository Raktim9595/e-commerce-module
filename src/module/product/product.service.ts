import { Injectable } from "@nestjs/common";
import { productRepository } from "./product.repository";
import { plainToInstance } from "class-transformer";
import { ProductResponseDto } from "./dto";

@Injectable()
export class ProductService {
    constructor(
        private readonly productRepositiry: productRepository
    ) { }

    async findAll(): Promise<ProductResponseDto[]> {
        const products = await this.productRepositiry.findAll();
        return plainToInstance(ProductResponseDto, products, {
            excludeExtraneousValues: true
        })
    }

    async findById(id: string): Promise<ProductResponseDto> {
        const product = await this.productRepositiry.findById(id);
        return plainToInstance(ProductResponseDto, product, {
            excludeExtraneousValues: true
        })
    }

    async updateStock(id: string, stock: number) {
        return this.productRepositiry.updateStock(id, stock);
    }
}