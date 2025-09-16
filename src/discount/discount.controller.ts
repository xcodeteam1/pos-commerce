import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Discount')
@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi chegirma yaratish' })
  @ApiResponse({
    status: 201,
    description: 'Chegirma muvaffaqiyatli yaratildi',
  })
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.create(createDiscountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha chegirmalarni olish' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 10,
    @Query('search') search?: string,
  ) {
    return this.discountService.findAll(page, pageSize, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID boyicha chegirmalarni olish' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.discountService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Chegirmani yangilash' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    return this.discountService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Chegirmani o‘chirish' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountService.remove(id);
  }
}
