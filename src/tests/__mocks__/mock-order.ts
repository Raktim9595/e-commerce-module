import { Types } from "mongoose";
import { Order, OrderItem, OrderStatus, PaymentProvider, PaymentStatus } from "src/module/order";
import { ProductType } from "src/module/product/model";

export const mockOrderItem = (args?: Partial<OrderItem>): OrderItem => ({
    lineTotal: 300,
    pricePerUnit: 50,
    productBrand: "Nike",
    productId: new Types.ObjectId(),
    productName: "Air Max",
    productType: ProductType.SHOES,
    quantity: 6,
    ...args
})

export const mockOrderBuilder = (args?: Partial<Order & { _id?: string }>): Order => ({
    userId: "1",
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    paymentProvider: PaymentProvider.STRIPE,
    items: [mockOrderItem()],
    shippingAddress: "AU",
    totalAmount: 300,
    ...args,
})