import { Types } from "mongoose";
import { Cart } from "src/module/cart";


export const mockCartBuilder = (args?: Partial<Cart>) => ({
    items: [{
        product: new Types.ObjectId(),
        quantity: 10,
    }],
    userId: "1",
    ...args,
})