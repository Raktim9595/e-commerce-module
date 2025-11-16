import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { orderService } from "./order.service";
import { CreateOrderDto, OrderConfirmationDto } from "./dto";
import { ParseObjectIdPipe } from "@nestjs/mongoose";

@Controller('order')
@ApiTags("order")
export class OrderController {
    constructor(
        private readonly orderService: orderService
    ) { }


    @Get("/user/:id")
    async getUserOrders(@Param('id') userId: string) {
        return this.orderService.findByUserId(userId);
    }

    @Get("/:id")
    async getOrderById(@Param('id', ParseObjectIdPipe) id: string) {
        return this.orderService.findById(id);
    }

    @Post()
    async placeOrder(@Body() orderDto: CreateOrderDto) {
        return this.orderService.placeOrder(orderDto);
    }

    @Post("/:id/checkout")
    async confirmOrder(@Param('id', ParseObjectIdPipe) id: string, @Body() orderDto: OrderConfirmationDto) {
        return this.orderService.confirmOrder(id, orderDto)
    }
}