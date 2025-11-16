import { Controller, Headers, Post, Req, Request } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PaymentService } from "./payment.service";

@Controller("payment")
@ApiTags("Payment")
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService
    ) { }

    @Post("webhook")
    async handleStripeWebhook(
        @Req() req: Request & { rawBody: Buffer },
        @Headers('stripe-signature') signature: string
    ) {
        return this.paymentService.handleWebHook(req.rawBody, signature);
    }
}
