import { Product, ProductType } from "src/module/product/model";

export const mockProductBuilder = (values?: Partial<Product & { _id?: string }>) => ({
    brand: "Nike",
    description: "Description",
    isActive: true,
    name: "Air Max",
    price: 100,
    stock: 10,
    type: ProductType.SHOES,
    _id: "1",

    ...values
})