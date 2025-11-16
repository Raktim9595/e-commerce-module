import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsNumber } from "class-validator";

export class CreateCartDto {
    @ApiProperty({
        type: String,
        required: true,
    })
    @IsNotEmpty()
    userId: string

    @ApiProperty({
        type: String,
        required: true,
    })
    @IsMongoId()
    @IsNotEmpty()
    productId: string

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        type: Number,
        required: true,
    })
    quantity: number
}