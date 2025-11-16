import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class OrderConfirmationDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        required: true
    })
    userId: string;
}