import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

export enum ProductType {
    CLOTHING = 'CLOTHING',
    WATCHES = 'WATCHES',
    PHONE = 'PHONE',
    SHOES = "SHOES",
    ACCESSORIES = "ACCESSORIES",
    GADGETS = "GADGETS",
}

@Schema({ timestamps: true })
export class Product {
    @Prop({ required: true, trim: true, type: String })
    name: string;

    @Prop({ trim: true, type: String })
    description: string;

    @Prop({ required: true, trim: true, type: String })
    brand: string;

    @Prop({
        required: true,
        enum: ProductType,
    })
    type: ProductType;

    @Prop({ required: true, min: 0, type: Number })
    price: number;

    @Prop({ required: true, min: 0, type: Number })
    stock: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.set("toJSON", {
    virtuals: true,

    transform: (_, ret: any) => {
        ret.id = ret._id.toString();
    }
})