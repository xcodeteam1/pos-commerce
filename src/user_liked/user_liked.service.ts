import { Injectable, NotFoundException } from '@nestjs/common';
import { UserLikedRepository } from './user_liked.repository';
import { CreateUserLikedDto } from './dto/create-user_liked.dto';

@Injectable()
export class UserLikedService {
  constructor(private readonly userLikedRepo: UserLikedRepository) {}

  /**
   * user_id boyicha barcha like’larni olish (faqat is_order = false bolganlar)
   */
  async findAllByUser(
    userId: number,
    page = 1,
    pageSize = 10,
    search?: string,
  ) {
    return this.userLikedRepo.getAllByUser(userId, page, pageSize, search);
  }

  /**
   * Like ID boyicha olish (product ma’lumotlari bilan)
   */
  async findOne(id: number) {
    const like = await this.userLikedRepo.getById(id);
    if (!like) throw new NotFoundException(`Like with ID ${id} not found`);
    return like;
  }

  /**
   * user product’ga like bosadi
   */
  async create(dto: CreateUserLikedDto) {
    return this.userLikedRepo.create({
      user_id: dto.user_id,
      product_barcode: dto.product_barcode,
    });
  }

  /**
   * Like ID boyicha ochirish
   */
  async remove(id: number) {
    return this.userLikedRepo.delete(id);
  }
}
