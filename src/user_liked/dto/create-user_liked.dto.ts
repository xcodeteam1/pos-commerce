import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';

export class CreateUserLikedDto {
  @ApiProperty({
    example: 1,
    description: 'Like bosayotgan foydalanuvchining ID raqami',
  })
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({
    example: 'ABC12345',
    description: 'Like bosilgan mahsulotning barcode qiymati',
  })
  @IsString()
  @IsNotEmpty()
  product_barcode: string;
}
