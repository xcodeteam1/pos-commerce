import { Injectable, NotFoundException } from '@nestjs/common';
import { SaleRepo } from './sale.repository';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SaleService {
  constructor(private readonly saleRepo: SaleRepo) {}

  /**
   * Barcha buyurtmalarni olish (pagination bilan)
   */
  async findAll(page = 1, pageSize = 10, userId: number) {
    return this.saleRepo.getAll(page, pageSize, userId);
  }

  /**
   * Sale ID bo‘yicha bitta yozuvni olish
   */
  async findOne(id: number) {
    const sale = await this.saleRepo.getById(id);
    if (!sale) throw new NotFoundException(`Sale with ID ${id} not found`);
    return sale;
  }

  /**
   * Yangi buyurtma qo‘shish
   * — agar user_liked jadvalida shu product mavjud bo‘lsa → is_order = true qilinadi
   */
  async create(dto: CreateSaleDto) {
    return this.saleRepo.create({
      user_id: dto.user_id,
      product_barcode: dto.product_barcode,
      quantity: dto.quantity,
      total_price: dto.total_price,
    });
  }

  /**
   * Buyurtmani o‘chirish
   */
  async remove(id: number) {
    return this.saleRepo.delete(id);
  }
}
