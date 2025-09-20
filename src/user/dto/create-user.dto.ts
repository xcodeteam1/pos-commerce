import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  MaxLength,
} from 'class-validator';

export enum UserGender {
  male = 'male',
  female = 'female',
}

export class CreateUserDto {
  @ApiProperty({
    example: 'Isomiddinov',
    description: 'Foydalanuvchining familiyasi',
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  last_name?: string;

  @ApiProperty({
    example: 'Ruzimuhammad',
    description: 'Foydalanuvchining ismi',
  })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  first_name: string;

  @ApiPropertyOptional({
    example: 'Abdulloh',
    description: 'Foydalanuvchining otasining ismi',
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  middle_name?: string;

  @ApiPropertyOptional({
    enum: UserGender,
    example: UserGender.male,
    description: 'Foydalanuvchining jinsi',
  })
  @IsEnum(UserGender)
  @IsOptional()
  gender?: UserGender;

  @ApiPropertyOptional({
    example: 'test@example.com',
    description: 'Elektron pochta manzili',
  })
  @IsEmail()
  @MaxLength(150)
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+998901234567', description: 'Telefon raqami' })
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  phone_number: string;
}
