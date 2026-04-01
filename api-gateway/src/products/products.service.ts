import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductsGatewayService {
  private readonly productsServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.productsServiceUrl = this.configService.get<string>('PRODUCTS_SERVICE_URL', '');
  }

  async findAll() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.productsServiceUrl}/products`),
      );
      return response.data;
    } catch {
      throw new BadRequestException('Could not connect to products service');
    }
  }

  async findOne(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.productsServiceUrl}/products/${id}`),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new BadRequestException(`Product with id ${id} not found`);
      }
      throw new BadRequestException('Could not connect to products service');
    }
  }

  async create(body: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.productsServiceUrl}/products`, body),
      );
      return response.data;
    } catch (error) {
      throw new BadRequestException(
        error.response?.data?.message || 'Could not connect to products service',
      );
    }
  }

  async update(id: number, body: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.productsServiceUrl}/products/${id}`, body),
      );
      return response.data;
    } catch (error) {
      throw new BadRequestException(
        error.response?.data?.message || 'Could not connect to products service',
      );
    }
  }
}