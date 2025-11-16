import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from 'src/module/product/model';

export type OrderDocument = Order & Document;

export enum OrderStatus {
    PENDING = 'PENDING',
    PENDING_PAYMENT = "PENDING_PAYMENT",
    PAID = 'PAID',
    DELIVERED = 'DELIVERED',
    SHIPPING = 'SHIPPING',
    RETURNED = 'RETURNED',
    CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export enum PaymentProvider {
    STRIPE = 'STRIPE',
    PAYPAL = 'PAYPAL',
}

@Schema({ _id: false })
export class OrderItem {
    @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
    productId: Types.ObjectId;

    // snapshot fields at purchase time
    @Prop({ required: true })
    productName: string;

    @Prop({ required: true })
    productBrand: string;

    @Prop({ required: true })
    productType: string;

    @Prop({ required: true, min: 1 })
    quantity: number;

    @Prop({ required: true, min: 0 })
    pricePerUnit: number;

    @Prop({ required: true, min: 0 })
    lineTotal: number;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ type: [OrderItemSchema], default: [] })
    items: OrderItem[];

    @Prop({ required: true, min: 0 })
    totalAmount: number;

    @Prop({
        type: String,
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Prop({
        type: String,
        required: true,
    })
    shippingAddress: string;

    @Prop({
        type: String,
        required: false
    })
    notes?: string;


    @Prop({
        type: String,
        enum: PaymentProvider,
        required: false,
    })
    paymentProvider?: string;

    @Prop({
        type: String,
        required: false
    })
    paymentReference?: string; // e.g. transaction id

    @Prop({
        type: String,
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    paymentStatus: PaymentStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.set("toJSON", {
    virtuals: true,

    transform: (_, ret: any) => {
        ret.id = ret._id.toString();
    }
})
