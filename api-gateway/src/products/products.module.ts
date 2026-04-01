import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductsGatewayController } from './products.controller';
import { ProductsGatewayService } from './products.service';

@Module({
  imports: [HttpModule],
  controllers: [ProductsGatewayController],
  providers: [ProductsGatewayService],
})
export class ProductsGatewayModule {}