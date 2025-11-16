import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";

export class CreateOrderDto {
    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        required: true,
    })
    cartId: string

    @IsNotEmpty()
    @ApiProperty({
        type: String,
        required: true,
    })
    userId: string

    @IsNotEmpty()
    @ApiProperty({
        type: String,
        required: true,
    })
    shippingAddress: string

    @ApiProperty({
        type: String,
        required: false,
    })
    notes?: string
}