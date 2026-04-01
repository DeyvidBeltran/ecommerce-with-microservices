import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { OrdersGatewayService } from './orders.service';

@Controller('orders')
export class OrdersGatewayController {
  constructor(private readonly ordersGatewayService: OrdersGatewayService) {}

  @Get()
  findAll() {
    return this.ordersGatewayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersGatewayService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.ordersGatewayService.create(body);
  }
}
