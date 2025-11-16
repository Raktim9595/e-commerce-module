// src/module/product/product-seed.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// 👈 adjust the path if your folder structure is slightly different
import productsData from "../../data.json"
import { Product, ProductDocument } from 'src/module/product/model';

@Injectable()
export class ProductSeedService implements OnModuleInit {
    private readonly logger = new Logger(ProductSeedService.name);

    constructor(
        @InjectModel(Product.name)
        private readonly productModel: Model<ProductDocument>,
    ) { }

    async onModuleInit() {
        this.logger.log('Seeding products: clearing collection and inserting fixtures…');

        // 1) delete all existing products
        await this.productModel.deleteMany({});

        // 2) insert from data.json
        if (Array.isArray(productsData) && productsData.length > 0) {
            await this.productModel.insertMany(productsData);
            this.logger.log(`Inserted ${productsData.length} products`);
        } else {
            this.logger.warn('productsData is empty or not an array');
        }
    }
}
