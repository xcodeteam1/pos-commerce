import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepo } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepo) {}

  /**
   * Birinchi kirishda foydalanuvchini yaratish
   * (telefon raqami va ism orqali)
   */
  async createIfNotExists(
    createUserDto: CreateUserDto & { guest_ip?: string },
  ) {
    return this.userRepo.createIfNotExists({
      first_name: createUserDto.first_name,
      phone_number: createUserDto.phone_number,
      guest_ip: createUserDto.guest_ip,
    });
  }

  /**
   * Telefon raqami orqali login
   */
  async loginByPhone(phone: string) {
    if (!phone || phone.trim() === '') {
      throw new BadRequestException('phone_number is required');
    }
    return this.userRepo.loginByPhone(phone);
  }

  /**
   * ID bo‘yicha foydalanuvchini olish
   */
  async findOne(id: number) {
    return this.userRepo.getById(id);
  }

  /**
   * Foydalanuvchi ma’lumotlarini yangilash
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    // Faqat kelgan fieldlarni yig‘ish
    return this.userRepo.updateUser(id, updateUserDto);
  }
}
