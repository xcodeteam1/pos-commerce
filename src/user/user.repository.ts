import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { db1 } from '../../utils/dbs_config';

const insertQuery = `
  INSERT INTO "users" (first_name, phone_number, guest_ip)
    VALUES (?, ?, ?)
    RETURNING id, first_name, phone_number, last_name, middle_name, gender, email, created_at, updated_at;
  `;

const findByPhoneQuery = `
    SELECT id, first_name, last_name, middle_name, gender, email, phone_number, created_at, updated_at
    FROM "users"
    WHERE phone_number = ?;
  `;

const findByIdQuery = `
    SELECT id, first_name, last_name, middle_name, gender, email, phone_number, created_at, updated_at
    FROM "users"
    WHERE id = ?;
  `;

const updateQuery = `
    UPDATE "users"
    SET
      last_name = COALESCE(?, last_name),
      middle_name = COALESCE(?, middle_name),
      gender = COALESCE(?, gender),
      email = COALESCE(?, email),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    RETURNING id, first_name, last_name, middle_name, gender, email, phone_number,  created_at, updated_at;
  `;

@Injectable()
export class UserRepo {
  /**
   * Birinchi kirishda foydalanuvchini yaratish
   * Agar shu telefon raqami mavjud bo‘lsa, mavjud foydalanuvchi qaytariladi
   */
  async createIfNotExists(data: {
    first_name: string;
    phone_number: string;
    guest_ip?: string;
  }) {
    if (!data.first_name || data.first_name.trim() === '') {
      throw new BadRequestException('first_name is required');
    }
    if (!data.phone_number || data.phone_number.trim() === '') {
      throw new BadRequestException('phone_number is required');
    }

    // Avval telefon bo‘yicha foydalanuvchini tekshiramiz
    const existing = await db1.raw(findByPhoneQuery, [data.phone_number]);

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    // Yangi foydalanuvchini yaratish
    const res = await db1.raw(insertQuery, [
      data.first_name,
      data.phone_number,
      data.guest_ip ?? null,
    ]);

    return res.rows[0];
  }

  /**
   * Telefon raqami bo‘yicha login
   */
  async loginByPhone(phone: string) {
    if (!phone || phone.trim() === '') {
      throw new BadRequestException('phone_number is required');
    }

    const res = await db1.raw(findByPhoneQuery, [phone]);
    const user = res.rows[0];

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'Foydalanuvchi topilmadi',
      });
    }

    return { success: true, user };
  }

  /**
   * ID bo‘yicha foydalanuvchini olish
   */
  async getById(id: number) {
    const res = await db1.raw(findByIdQuery, [id]);
    const user = res.rows[0];

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { success: true, user };
  }

  /**
   * Foydalanuvchi ma’lumotlarini yangilash
   */
  // Update user
  // Update user
  async updateUser(
    id: number,
    data: Partial<{
      last_name: string;
      first_name: string;
      middle_name: string;
      gender: 'male' | 'female';
      email: string;
      phone_number: string;
    }>,
  ) {
    // Faqat kelgan fieldlarni yig‘ish
    const updateData: Record<string, any> = {};

    if (data.last_name !== undefined) updateData.last_name = data.last_name;
    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.middle_name !== undefined)
      updateData.middle_name = data.middle_name;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone_number !== undefined)
      updateData.phone_number = data.phone_number;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Hech qanday maydon yuborilmadi!');
    }

    // updated_at ni ham qo‘shamiz
    updateData.updated_at = db1.fn.now();

    const [updated] = await db1('users')
      .where({ id })
      .update(updateData)
      .returning([
        'id',
        'first_name',
        'last_name',
        'middle_name',
        'gender',
        'email',
        'phone_number',
        'created_at',
        'updated_at',
      ]);

    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { success: true, updated };
  }
}
