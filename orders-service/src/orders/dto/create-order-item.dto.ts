import { IsNumber, IsPositive, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}
