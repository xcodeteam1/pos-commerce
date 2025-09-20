import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Foydalanuvchining familiyasi',
    example: 'Isomiddinov',
  })
  last_name?: string;

  @ApiPropertyOptional({
    description: 'Foydalanuvchining ismi',
    example: 'Ruzimuhammad',
  })
  first_name?: string;

  @ApiPropertyOptional({ description: 'Otasining ismi', example: 'Abdulloh' })
  middle_name?: string;

  @ApiPropertyOptional({
    description: 'Jinsi',
    enum: ['male', 'female'],
    example: 'male',
  })
  gender?: 'male' | 'female';

  @ApiPropertyOptional({
    description: 'Elektron pochta',
    example: 'test@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Telefon raqami',
    example: '+998901234567',
  })
  phone_number?: string;
}
