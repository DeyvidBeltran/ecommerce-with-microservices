import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ProductsGatewayModule } from './products/products.module';
import { OrdersGatewayModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    ProductsGatewayModule,
    OrdersGatewayModule,
  ],
})
export class AppModule {}
