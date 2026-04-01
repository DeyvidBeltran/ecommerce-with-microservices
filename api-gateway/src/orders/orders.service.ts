import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersGatewayService {
  private readonly ordersServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.ordersServiceUrl = this.configService.get<string>('ORDERS_SERVICE_URL', '');
  }

  async findAll() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.ordersServiceUrl}/orders`),
      );
      return response.data;
    } catch {
      throw new BadRequestException('Could not connect to orders service');
    }
  }

  async findOne(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.ordersServiceUrl}/orders/${id}`),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new BadRequestException(`Order with id ${id} not found`);
      }
      throw new BadRequestException('Could not connect to orders service');
    }
  }

  async create(body: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.ordersServiceUrl}/orders`, body),
      );
      return response.data;
    } catch (error) {
      throw new BadRequestException(
        error.response?.data?.message || 'Could not connect to orders service',
      );
    }
  }
}