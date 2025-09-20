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
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@ApiTags('Sale')
@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  /**
   * Yangi buyurtma qoshish
   * — agar foydalanuvchi ilgari like bosgan bolsa, `user_liked.is_order = true` qilinadi
   */
  @Post()
  @ApiOperation({ summary: 'Yangi buyurtma qoshish' })
  @ApiBody({ type: CreateSaleDto })
  @ApiResponse({ status: 201, description: 'Buyurtma muvaffaqiyatli qoshildi' })
  @ApiResponse({ status: 400, description: 'Malumotlar notogri yuborilgan' })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi' })
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.saleService.create(createSaleDto);
  }

  /**
   * Barcha buyurtmalarni olish (pagination)
   * GET /sale/list?page=1&pageSize=10
   */
  @Get('list')
  @ApiOperation({ summary: 'Barcha buyurtmalarni olish (pagination bilan)' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    example: 1,
    description: 'Sahifa raqami (default = 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    required: false,
    example: 10,
    description: 'Har bir sahifadagi yozuvlar soni (default = 10)',
  })
  @ApiQuery({
    name: 'userId',
    type: Number,
    required: true,
    example: 1,
    description: 'user ning ID si',
  })
  @ApiResponse({ status: 200, description: 'Buyurtmalar royxati' })
  findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('userId') userId?: number,
  ) {
    return this.saleService.findAll(
      Number(page),
      Number(pageSize),
      Number(userId),
    );
  }

  /**
   * Sale ID boyicha bitta buyurtmani olish
   */
  @Get(':id')
  @ApiOperation({ summary: 'Sale ID boyicha bitta buyurtmani olish' })
  @ApiResponse({ status: 200, description: 'Topilgan buyurtma' })
  @ApiResponse({ status: 404, description: 'Buyurtma topilmadi' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.saleService.findOne(id);
  }

  /**
   * Buyurtmani ochirish
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Buyurtmani ochirish' })
  @ApiResponse({
    status: 200,
    description: 'Buyurtma muvaffaqiyatli ochirildi',
  })
  @ApiResponse({ status: 404, description: 'Buyurtma topilmadi' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.saleService.remove(id);
  }
}
