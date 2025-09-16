import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDiscountDto {
  @ApiProperty({ example: '1234567890123', description: 'Mahsulot barcodi' })
  @IsString()
  product_barcode: string;

  @ApiProperty({ example: 12000, description: 'Chegirmadagi narx' })
  @IsNumber()
  discount_price: number;

  @ApiProperty({ example: 15000, description: 'Eski narx' })
  @IsNumber()
  old_price: number;

  @ApiPropertyOptional({
    example: 'Chegirma faqat sentyabr oyigacha amal qiladi',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
