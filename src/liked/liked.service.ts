import { Injectable, NotFoundException } from '@nestjs/common';
import { LikedRepo } from './liked.repository';
import { CreateLikedDto } from './dto/create-liked.dto';

@Injectable()
export class LikedService {
  constructor(private readonly likedRepo: LikedRepo) {}

  /**
   * Guest ID bo‘yicha barcha like’larni (product ma’lumotlari bilan) olish
   */
  async findAllByGuest(
    guestId: number,
    page = 1,
    pageSize = 10,
    search?: string,
  ) {
    return this.likedRepo.getAllByGuest(guestId, page, pageSize, search);
  }

  /**
   * Like ID bo‘yicha bitta yozuvni olish (product ma’lumotlari bilan)
   */
  async findOne(id: number) {
    const like = await this.likedRepo.getById(id);
    if (!like) throw new NotFoundException(`Like with ID ${id} not found`);
    return like;
  }

  /**
   * Guest product’ga like bosadi
   */
  async create(dto: CreateLikedDto) {
    return this.likedRepo.create({
      guest_id: dto.guest_id,
      product_barcode: dto.product_barcode,
    });
  }

  /**
   * Like ID bo‘yicha o‘chirish
   */
  async remove(id: number) {
    return this.likedRepo.delete(id);
  }
}
