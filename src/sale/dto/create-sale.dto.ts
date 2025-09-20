import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateSaleDto {
  @ApiProperty({
    example: 1,
    description: 'Buyurtma qilayotgan foydalanuvchi ID si',
  })
  @IsInt()
  user_id: number;

  @ApiProperty({
    example: 'ABC123',
    description: 'Mahsulotning barcode qiymati',
  })
  @IsString()
  @IsNotEmpty()
  product_barcode: string;

  @ApiProperty({
    example: 2,
    description: 'Buyurtma qilinayotgan mahsulot soni',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({
    example: 150000,
    description: 'Umumiy summa',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_price?: number;
}
