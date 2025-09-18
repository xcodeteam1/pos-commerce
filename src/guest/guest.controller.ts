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
  Ip,
} from '@nestjs/common';
import { GuestService } from './guest.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Guest')
@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Guest muvaffaqiyatli qoshildi' })
  create(@Body() dto: CreateGuestDto, @Ip() ip: string) {
    return this.guestService.create(ip, dto);
  }

  @Get('/list')
  @ApiOperation({ summary: 'Barcha guestlarni olish' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 10,
    @Query('search') search?: string,
  ) {
    return this.guestService.findAll(page, pageSize, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID boyicha guestni olish' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.guestService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Guestni ochirish' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.guestService.remove(id);
  }
}
