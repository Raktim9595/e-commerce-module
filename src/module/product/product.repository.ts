import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Product } from "./model";

@Injectable()
export class productRepository {
    constructor(
        @InjectModel(Product.name)
        private readonly productModel: Model<Product>) { }

    async findAll(): Promise<Product[]> {
        return this.productModel.find().exec();
    }

    async findById(id: string): Promise<Product | null> {
        return this.productModel.findById(id).exec();
    }

    async updateStock(id: string, stock: number) {
        return this.productModel.updateOne({ _id: id }, { $set: { stock } }).exec();
    }
}