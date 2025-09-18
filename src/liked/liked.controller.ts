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
import { LikedService } from './liked.service';
import { CreateLikedDto } from './dto/create-liked.dto';

@ApiTags('Liked')
@Controller('liked')
export class LikedController {
  constructor(private readonly likedService: LikedService) {}

  /**
   * Guest biror productga like bosadi
   */
  @Post()
  @ApiOperation({ summary: 'Productga like bosish' })
  @ApiBody({ type: CreateLikedDto })
  @ApiResponse({ status: 201, description: 'Like muvaffaqiyatli yaratildi' })
  @ApiResponse({
    status: 400,
    description: 'guest_id yoki product_barcode notogri',
  })
  create(@Body() createLikedDto: CreateLikedDto) {
    return this.likedService.create(createLikedDto);
  }

  /**
   * Guest ID boyicha barcha likelarni olish (pagination + search)
   * GET /liked?guest_id=1&page=1&pageSize=10&search=abc
   */
  @Get('list')
  @ApiOperation({
    summary: 'Guest ID boyicha barcha likelarni olish (pagination, qidiruv)',
  })
  @ApiQuery({
    name: 'guest_id',
    type: Number,
    required: true,
    description: 'Likelarni olish uchun Guest ID',
    example: 1,
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
    description: 'Har bir sahifada nechta yozuv (default = 10)',
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Mahsulot nomi yoki barcodeni qidirish uchun',
    example: 'iphone',
  })
  @ApiResponse({
    status: 200,
    description: 'Likelar royxati pagination bilan',
  })
  findAll(
    @Query('guest_id', ParseIntPipe) guestId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('search') search?: string,
  ) {
    return this.likedService.findAllByGuest(
      guestId,
      Number(page),
      Number(pageSize),
      search,
    );
  }

  /**
   * Like ID boyicha bitta yozuvni olish
   */
  @Get(':id')
  @ApiOperation({ summary: 'Like ID boyicha bitta yozuvni olish (liked_id)' })
  @ApiResponse({ status: 200, description: 'Topilgan like yozuvi' })
  @ApiResponse({ status: 404, description: 'Like topilmadi' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.likedService.findOne(id);
  }

  /**
   * Like’ni ochirish
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Like yozuvini ochirish' })
  @ApiResponse({ status: 200, description: 'Like muvaffaqiyatli ochirildi' })
  @ApiResponse({ status: 404, description: 'Like topilmadi' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.likedService.remove(id);
  }
}
