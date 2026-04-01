import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly productsServiceUrl: string;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.productsServiceUrl = this.configService.get<string>('PRODUCTS_SERVICE_URL', '');
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderItems: OrderItem[] = [];
    let total = 0;

    // Validar cada producto contra el products-service
    for (const itemDto of createOrderDto.items) {
      const product = await this.getProduct(itemDto.productId);

      if (product.stock < itemDto.quantity) {
        throw new BadRequestException(
          `Product "${product.name}" only has ${product.stock} units in stock`,
        );
      }

      const subtotal = product.price * itemDto.quantity;
      total += subtotal;

      const orderItem = this.orderItemRepository.create({
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: itemDto.quantity,
        subtotal,
      });

      orderItems.push(orderItem);
    }

    const order = this.orderRepository.create({
      customerName: createOrderDto.customerName,
      items: orderItems,
      total,
    });

    return this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  private async getProduct(productId: number): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.productsServiceUrl}/products/${productId}`),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Product with id ${productId} not found`);
      }
      throw new BadRequestException('Could not connect to products service');
    }
  }
}