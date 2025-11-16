import { Controller, Get } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ApiTags } from "@nestjs/swagger";

@Controller('product')
@ApiTags('Product')
export class ProductController {
    constructor(
        private readonly productService: ProductService
    ) { }

    @Get()
    async findAll() {
        return this.productService.findAll();
    }
}