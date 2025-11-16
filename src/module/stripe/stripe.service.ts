import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private readonly stripe: Stripe;

    constructor(private readonly config: ConfigService) {
        const SECRET_KEY = this.config.get<string>('STRIPE_SECRET_KEY');
        if (!SECRET_KEY) {
            throw new InternalServerErrorException('Stripe secret key is not defined');
        }

        this.stripe = new Stripe(SECRET_KEY, {
            apiVersion: '2025-10-29.clover',
        });
    }

    get client() {
        return this.stripe;
    }
}
