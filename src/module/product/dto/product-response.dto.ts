import { ApiProperty } from "@nestjs/swagger";
import { ProductType } from "../model/product.model";
import { Expose } from "class-transformer";

export class ProductResponseDto {
    @ApiProperty({
        type: String,
    })
    @Expose({ name: '_id' })
    id: string;

    @ApiProperty({
        type: String,
    })
    @Expose()
    name: string;

    @ApiProperty({
        type: String,
    })
    @Expose()
    description: string;

    @ApiProperty({
        type: String,
    })
    @Expose()
    brand: string;

    @ApiProperty({
        enum: ProductType,
        enumName: 'ProductType',
    })
    @Expose()
    type: ProductType;

    @ApiProperty({
        type: Number
    })
    @Expose()
    price: number;

    @ApiProperty({
        type: Number
    })
    @Expose()
    stock: number;

    @ApiProperty({
        type: Boolean,
    })
    @Expose()
    isActive: boolean;
}