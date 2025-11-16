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
        return this.orderModel.find({ userId }).populate("items.product").exec();
    }

    async findById(id: string) {
        return this.orderModel.findById(id).populate("items.product").exec();
    }
} 