import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CartService } from "./cart.service";
import { CreateCartDto } from "./dto";
import { ParseObjectIdPipe } from "@nestjs/mongoose";

@Controller('cart')
@ApiTags('cart')
export class CartController {
    constructor(
        private readonly cartService: CartService
    ) { }

    @Post()
    async createCart(@Body() cartDto: CreateCartDto) {
        return this.cartService.addItem(cartDto);
    }

    @Get("/user/:id")
    async getUserCarts(@Param('id') userId: string) {
        return this.cartService.findByUserId(userId);
    }

    @Get("/:id")
    async findById(@Param('id', ParseObjectIdPipe) id: string) {
        return this.cartService.findById(id);
    }
}