import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrdersGatewayController } from './orders.controller';
import { OrdersGatewayService } from './orders.service';

@Module({
  imports: [HttpModule],
  controllers: [OrdersGatewayController],
  providers: [OrdersGatewayService],
})
export class OrdersGatewayModule {}