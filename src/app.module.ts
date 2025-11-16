import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './utils';
import { ProductModule } from './module/product';
import { CartModule } from './module/cart';
import { OrderModule } from './module/order/order.module';
import { StripeModule } from './module/stripe';
import { PaymentModule } from './module/payment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    DatabaseModule,
    ProductModule,
    CartModule,
    OrderModule,
    StripeModule,
    PaymentModule
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule { }
