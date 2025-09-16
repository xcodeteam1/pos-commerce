import { Injectable } from '@nestjs/common';
import { DiscountRepo } from './discount.repository';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Injectable()
export class DiscountService {
  constructor(private readonly discountRepo: DiscountRepo) {}

  async create(createDiscountDto: CreateDiscountDto) {
    return this.discountRepo.create({
      product_barcode: createDiscountDto.product_barcode,
      discount_price: createDiscountDto.discount_price,
      old_price: createDiscountDto.old_price,
      description: createDiscountDto.description,
    });
  }

  async findAll(page: number, pageSize: number, search?: string) {
    return this.discountRepo.getAll(page, pageSize, search);
  }

  async findOne(id: number) {
    return this.discountRepo.getByID(id);
  }

  async update(id: number, updateDiscountDto: UpdateDiscountDto) {
    return this.discountRepo.update(id, {
      product_barcode: updateDiscountDto.product_barcode,
      discount_price: updateDiscountDto.discount_price,
      old_price: updateDiscountDto.old_price,
      description: updateDiscountDto.description,
    });
  }

  async remove(id: number) {
    return this.discountRepo.delete(id);
  }
}
