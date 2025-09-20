import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { db1, db2 } from '../../utils/dbs_config';

const createSaleQuery = `
    INSERT INTO sale(
      user_id,
      product_barcode,
      quantity,
      total_price
    )
    VALUES (?, ?, ?, ?)
    RETURNING id, user_id, product_barcode, quantity, total_price, created_at;
  `;

const getSaleByIdQuery = `
    SELECT *
    FROM sale
    WHERE id = ?;
  `;

const deleteSaleQuery = `
    DELETE FROM sale
    WHERE id = ?
    RETURNING *;
  `;

@Injectable()
export class SaleRepo {
  /**
   * Barcha buyurtmalarni olish (pagination bilan)
   */
  /**
   * Foydalanuvchining buyurtmalarini olish (pagination bilan)
   */
  async getAll(
    page = 1,
    pageSize = 10,
    userId?: number, // 👈 filter uchun parametr
  ) {
    const offset = (page - 1) * pageSize;

    // umumiy yozuvlar soni
    const totalRes = userId
      ? await db1.raw(`SELECT COUNT(*) FROM sale WHERE user_id = ?;`, [userId])
      : await db1.raw(`SELECT COUNT(*) FROM sale;`);
    const totalRecords = parseInt(totalRes.rows[0].count, 10);

    // asosiy ma’lumotlar
    const salesRes = userId
      ? await db1.raw(
          `
            SELECT *
            FROM sale
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
          `,
          [userId, pageSize, offset],
        )
      : await db1.raw(
          `
            SELECT *
            FROM sale
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
          `,
          [pageSize, offset],
        );

    // product ma’lumotlarini olish
    const barcodes = salesRes.rows.map((s: any) => s.product_barcode);
    let productMap = new Map();

    if (barcodes.length > 0) {
      const productsRes = await db2.raw(
        `SELECT * FROM product WHERE barcode = ANY(?)`,
        [barcodes],
      );
      productMap = new Map(productsRes.rows.map((p: any) => [p.barcode, p]));
    }

    const data = salesRes.rows.map((sale: any) => ({
      ...sale,
      product_info: productMap.get(sale.product_barcode) || null,
    }));

    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
      data,
      pagination: {
        total_records: totalRecords,
        current_page: page,
        total_pages: totalPages,
        next_page: page < totalPages ? page + 1 : null,
        prev_page: page > 1 ? page - 1 : null,
      },
    };
  }

  /**
   * Sale ID bo‘yicha bitta yozuvni olish (product bilan)
   */
  async getById(id: number) {
    const res = await db1.raw(getSaleByIdQuery, [id]);
    const sale = res.rows[0];

    if (!sale) throw new NotFoundException(`Sale with ID ${id} not found`);

    const productRes = await db2.raw(
      `SELECT * FROM product WHERE barcode = ?`,
      [sale.product_barcode],
    );

    return {
      ...sale,
      product_info: productRes.rows[0] || null,
    };
  }

  /**
   * Yangi buyurtma qo‘shish
   * Agar user_liked jadvalida shu product bo‘lsa -> is_order = true
   */
  async create(data: {
    user_id: number;
    product_barcode: string;
    quantity?: number;
    total_price?: number;
  }) {
    if (!data.user_id) {
      throw new BadRequestException('user_id is required');
    }
    if (!data.product_barcode || data.product_barcode.trim() === '') {
      throw new BadRequestException('product_barcode is required');
    }

    // 1️⃣ Mahsulot mavjudligini tekshiramiz
    const productRes = await db2.raw(
      `SELECT * FROM product WHERE barcode = ?`,
      [data.product_barcode],
    );
    const product = productRes.rows[0];
    if (!product) {
      throw new NotFoundException(
        `Product with barcode ${data.product_barcode} not found`,
      );
    }

    // 2️⃣ Sale jadvaliga yozuv qo‘shamiz
    const saleRes = await db1.raw(createSaleQuery, [
      data.user_id,
      data.product_barcode,
      data.quantity ?? 1,
      data.total_price ?? null,
    ]);
    const sale = saleRes.rows[0];

    // 3️⃣ user_liked jadvalida shu product bormi?
    const likedRes = await db1.raw(
      `SELECT id, is_order
         FROM user_liked
         WHERE user_id = ? AND product_barcode = ?
         LIMIT 1`,
      [data.user_id, data.product_barcode],
    );
    const liked = likedRes.rows[0];

    // Agar like mavjud bo‘lsa va is_order hali false bo‘lsa -> true qilamiz
    if (liked && liked.is_order === false) {
      await db1.raw(
        `UPDATE user_liked
           SET is_order = true
           WHERE id = ?`,
        [liked.id],
      );
    }

    return {
      success: true,
      data: {
        ...sale,
        product_info: product,
      },
    };
  }

  /**
   * Sale yozuvini o‘chirish
   */
  async delete(id: number) {
    const res = await db1.raw(deleteSaleQuery, [id]);
    const deleted = res.rows[0];
    if (!deleted) throw new NotFoundException(`Sale with ID ${id} not found`);

    return { success: true, deleted };
  }
}
