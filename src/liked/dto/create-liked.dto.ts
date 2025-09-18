import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLikedDto {
  @ApiProperty({
    example: 1,
    description: 'Like bosayotgan mehmonning (guest) ID raqami',
  })
  @IsInt()
  guest_id: number;

  @ApiProperty({
    example: 'ABC12345',
    description: 'Like bosilgan productning barcode qiymati',
  })
  @IsString()
  @IsNotEmpty()
  product_barcode: string;
}
