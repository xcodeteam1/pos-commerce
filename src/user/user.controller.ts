import {
  Controller,
  Post,
  Body,
  Ip,
  Get,
  Param,
  Patch,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Foydalanuvchini birinchi kirishda yaratish
   * (ism, telefon raqam va IP bilan)
   */
  @Post()
  @ApiOperation({ summary: 'Birinci kirishda foydalanuvchini yaratish' })
  @ApiResponse({
    status: 201,
    description:
      'Foydalanuvchi muvaffaqiyatli yaratildi yoki mavjud bolsa qaytarildi',
  })
  create(@Body() createUserDto: CreateUserDto, @Ip() guestIp: string) {
    return this.userService.createIfNotExists({
      ...createUserDto,
      guest_ip: guestIp,
    });
  }

  /**
   * Telefon raqami orqali login qilish
   * GET /user/login?phone=998901234567
   */
  @Get('login')
  @ApiOperation({ summary: 'Telefon raqami orqali login' })
  @ApiResponse({
    status: 200,
    description: 'Foydalanuvchi topildi yoki mavjud emas',
  })
  login(@Query('phone') phone: string) {
    return this.userService.loginByPhone(phone);
  }

  /**
   * ID boyicha foydalanuvchini olish
   */
  @Get(':id')
  @ApiOperation({ summary: 'ID boyicha foydalanuvchini olish' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi malumotlari' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  /**
   * Foydalanuvchi malumotlarini yangilash
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Foydalanuvchi malumotlarini yangilash' })
  @ApiResponse({
    status: 200,
    description: 'Foydalanuvchi muvaffaqiyatli yangilandi',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }
}
