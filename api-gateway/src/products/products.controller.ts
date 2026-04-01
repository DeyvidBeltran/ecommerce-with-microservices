import { Controller, Get, Post, Put, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ProductsGatewayService } from './products.service';

@Controller('products')
export class ProductsGatewayController {
  constructor(private readonly productsGatewayService: ProductsGatewayService) {}

  @Get()
  findAll() {
    return this.productsGatewayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsGatewayService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.productsGatewayService.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.productsGatewayService.update(id, body);
  }
}