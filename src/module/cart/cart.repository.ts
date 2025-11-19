import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cart, CartItem } from "./model";
import { Model, Types } from "mongoose";

@Injectable()
export class CartRepository {
    constructor(
        @InjectModel(Cart.name) private readonly cartModel: Model<Cart>
    ) { }

    async findById(id: string): Promise<Cart | null> {
        return this.cartModel.findById(id).populate("items.product").exec();
    }

    async findByUserId(userId: string): Promise<Cart | null> {
        return this.cartModel.findOne({ userId }).populate("items.product").exec();
    }

    async findByIdAndUserId(id: string, userId: string): Promise<Cart | null> {
        return this.cartModel.findOne({ _id: id, userId }).populate("items.product").exec();
    }

    async createCart(userId: string, items: CartItem[] = []): Promise<Cart> {
        return this.cartModel.create({ userId, items });
    }

    async updateCart(
        userId: string,
        newItems: CartItem[],
    ): Promise<Cart> {
        // 1) filter out 0 or negative quantities
        const filteredItems = newItems.filter((i) => i.quantity > 0)

        // 2) upsert the cart & set items in one atomic operation
        return this.cartModel.findOneAndUpdate(
            { userId },
            { $set: { items: filteredItems } },
            {
                new: true,   // return updated doc
                upsert: true // create cart if it does not exist
            },
        )
            .populate("items.product")
            .exec();
    }

    async clearCart(userId: string) {
        return this.cartModel.findOneAndDelete({ userId }).exec();
    }


}