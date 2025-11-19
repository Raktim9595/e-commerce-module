import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Product } from "./model";

@Injectable()
export class ProductRepository {
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

    async getStockInfo() {
        return this.productModel.aggregate([
            {
                $facet: {
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalProducts: { $sum: 1 },
                                totalStock: { $sum: "$stock" },
                            },
                        },
                        { $project: { _id: 0 } },
                    ],
                    products: [
                        {
                            $project: {
                                id: { $toString: "$_id" },
                                name: 1,
                                stock: 1,
                                _id: 0,
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    totalProducts: { $arrayElemAt: ["$summary.totalProducts", 0] },
                    totalStock: { $arrayElemAt: ["$summary.totalStock", 0] },
                    products: 1,
                },
            },
        ]).exec();
    }
}