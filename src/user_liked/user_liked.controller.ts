import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UserLikedService } from './user_liked.service';
import { CreateUserLikedDto } from './dto/create-user_liked.dto';

@ApiTags('UserLiked')
@Controller('user-liked')
export class UserLikedController {
  constructor(private readonly userLikedService: UserLikedService) {}

  /**
   * Foydalanuvchi mahsulotga like bosadi
   */
  @Post()
  @ApiOperation({ summary: 'Mahsulotga like bosish' })
  @ApiBody({ type: CreateUserLikedDto })
  @ApiResponse({ status: 201, description: 'Like muvaffaqiyatli yaratildi' })
  @ApiResponse({
    status: 400,
    description: 'user_id yoki product_barcode notogri',
  })
  create(@Body() dto: CreateUserLikedDto) {
    return this.userLikedService.create(dto);
  }

  /**
   * Foydalanuvchi ID boyicha barcha likelarni olish (faqat is_order = false)
   * GET /user-liked/list?user_id=1&page=1&pageSize=10&search=abc
   */
  @Get('list')
  @ApiOperation({
    summary:
      'Foydalanuvchi ID boyicha barcha likelarni olish (pagination, qidiruv)',
  })
  @ApiQuery({
    name: 'user_id',
    type: Number,
    required: true,
    example: 1,
    description: 'Foydalanuvchi ID (likelarni olish uchun)',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    example: 1,
    description: 'Qaysi sahifa (default = 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    required: false,
    example: 10,
    description: 'Har bir sahifada yozuvlar soni (default = 10)',
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Mahsulot nomi yoki barcode boyicha qidirish',
    example: 'iphone',
  })
  @ApiResponse({
    status: 200,
    description: 'Likelar royxati (pagination bilan)',
  })
  findAll(
    @Query('user_id', ParseIntPipe) userId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('search') search?: string,
  ) {
    return this.userLikedService.findAllByUser(
      userId,
      Number(page),
      Number(pageSize),
      search,
    );
  }

  /**
   * Like ID boyicha bitta yozuvni olish
   */
  @Get(':id')
  @ApiOperation({ summary: 'Like ID boyicha bitta yozuvni olish' })
  @ApiResponse({ status: 200, description: 'Topilgan like yozuvi' })
  @ApiResponse({ status: 404, description: 'Like topilmadi' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userLikedService.findOne(id);
  }

  /**
   * Like yozuvini ochirish
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Like yozuvini ochirish' })
  @ApiResponse({ status: 200, description: 'Like muvaffaqiyatli ochirildi' })
  @ApiResponse({ status: 404, description: 'Like topilmadi' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userLikedService.remove(id);
  }
}
