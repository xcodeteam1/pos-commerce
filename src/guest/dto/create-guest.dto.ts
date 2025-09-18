import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateGuestDto {
  @ApiProperty({
    example: 'Bu foydalanuvchi haqida izoh',
    description: 'Qo‘shimcha izoh (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
