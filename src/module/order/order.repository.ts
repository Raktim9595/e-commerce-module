import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Order, OrderItem, OrderStatus } from "./model";
import { Model } from "mongoose";

@Injectable()
export class OrderRepository {
    constructor(
        @InjectModel(Order.name) private readonly orderModel: Model<Order>
    ) { }

    async createOrder(newOrder: Partial<Order>) {
        return this.orderModel.create(newOrder);
    }

    async findByUserId(userId: string) {
        return this.orderModel.find({ userId }).exec();
    }

    async findById(id: string) {
        return this.orderModel.findById(id).exec();
    }

    async findByIdAndUpdate(id: string, data: Partial<Order>) {
        await this.findByIdAndUpdate(id, data)
    }
} 