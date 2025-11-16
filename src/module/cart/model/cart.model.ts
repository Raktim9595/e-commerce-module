import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from 'src/module/product/model';

export type CartDocument = Cart & Document;

@Schema({ _id: false })
export class CartItem {
    // item should be unique in the cart
    @Prop({ type: Types.ObjectId, ref: Product.name, required: true, unique: true })
    product: Types.ObjectId;

    @Prop({ required: true, min: 1 })
    quantity: number;
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
    // adjust type depending on your auth system (string token, user _id, etc.)
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ type: [CartItemSchema], default: [] })
    items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
CartSchema.set("toJSON", {
    virtuals: true,

    transform: (_, ret: any) => {
        ret.id = ret._id.toString();
    }
})
