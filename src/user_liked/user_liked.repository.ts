import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { db1, db2 } from '../../utils/dbs_config';

const getByIdQuery = `
    SELECT id, user_id, product_barcode, is_order, created_at
    FROM user_liked
    WHERE id = ?;
  `;

const createQuery = `
    INSERT INTO user_liked (
      user_id,
      product_barcode
    )
    VALUES (?, ?)
    RETURNING id, user_id, product_barcode, is_order, created_at;
  `;

const deleteQuery = `
    DELETE FROM user_liked
    WHERE id = ?
    RETURNING id, user_id, product_barcode, is_order, created_at;
  `;

@Injectable()
export class UserLikedRepository {
  /**
   * user_id boyicha barcha like’larni olish (faqat is_order = false bolganlar)
   */
  async getAllByUser(userId: number, page = 1, pageSize = 10, search?: string) {
    const offset = (page - 1) * pageSize;
    let totalCountRes;
    let likesRes;

    if (search && search.trim() !== '') {
      const fullText = search;
      const ilike = `%${search}%`;

      totalCountRes = await db1.raw(
        `
          SELECT COUNT(*)
          FROM user_liked ul
          JOIN product p ON p.barcode = ul.product_barcode
          WHERE ul.user_id = ?
            AND ul.is_order = false
            AND (
              to_tsvector('simple', p.name) @@ plainto_tsquery(?)
              OR p.name ILIKE ?
              OR p.barcode ILIKE ?
            )
          `,
        [userId, fullText, ilike],
      );

      likesRes = await db1.raw(
        `
          SELECT ul.*, p.name AS product_name
          FROM user_liked ul
          JOIN product p ON p.barcode = ul.product_barcode
          WHERE ul.user_id = ?
            AND ul.is_order = false
            AND (
              to_tsvector('simple', p.name) @@ plainto_tsquery(?)
              OR p.name ILIKE ?
              OR p.barcode ILIKE ?
            )
          ORDER BY ul.created_at DESC
          LIMIT ? OFFSET ?
          `,
        [userId, fullText, ilike, pageSize, offset],
      );
    } else {
      totalCountRes = await db1.raw(
        `SELECT COUNT(*) FROM user_liked WHERE user_id = ? AND is_order = false`,
        [userId],
      );

      likesRes = await db1.raw(
        `
          SELECT *
          FROM user_liked
          WHERE user_id = ? AND is_order = false
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?
          `,
        [userId, pageSize, offset],
      );
    }

    const totalRecords = parseInt(totalCountRes.rows[0].count, 10);
    const likes = likesRes.rows;

    if (likes.length === 0) {
      return {
        data: [],
        pagination: {
          total_records: 0,
          current_page: page,
          total_pages: 0,
          next_page: null,
          prev_page: null,
        },
      };
    }

    const barcodes = likes.map((l: any) => l.product_barcode);
    const productsRes = await db2.raw(
      `SELECT * FROM product WHERE barcode = ANY(?)`,
      [barcodes],
    );
    const productMap = new Map(
      productsRes.rows.map((p: any) => [p.barcode, p]),
    );

    const data = likes.map((like: any) => ({
      ...like,
      product_info: productMap.get(like.product_barcode) || null,
    }));

    const totalPages = Math.ceil(totalRecords / pageSize);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return {
      data,
      pagination: {
        total_records: totalRecords,
        current_page: page,
        total_pages: totalPages,
        next_page: nextPage,
        prev_page: prevPage,
      },
    };
  }

  /**
   * ID boyicha olish (product ma’lumotlari bilan)
   */
  async getById(id: number) {
    const res = await db1.raw(getByIdQuery, [id]);
    const like = res.rows[0];

    if (!like) {
      throw new NotFoundException(`Like with ID ${id} not found`);
    }

    const productRes = await db2.raw(
      `SELECT * FROM product WHERE barcode = ?`,
      [like.product_barcode],
    );

    return {
      ...like,
      product_info: productRes.rows[0] || null,
    };
  }

  /**
   * user product’ga like bosadi
   * agar shu product allaqachon like qilingan bolsa, yangisini yaratmaydi
   */
  async create(data: { user_id: number; product_barcode: string }) {
    if (!data.user_id) {
      throw new BadRequestException('user_id is required');
    }
    if (!data.product_barcode || data.product_barcode.trim() === '') {
      throw new BadRequestException('product_barcode is required');
    }

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

    const checkQuery = `
        SELECT id
        FROM user_liked
        WHERE user_id = ? AND product_barcode = ?
        LIMIT 1;
      `;
    const existing = await db1.raw(checkQuery, [
      data.user_id,
      data.product_barcode,
    ]);

    if (existing.rows.length > 0) {
      return { success: true, alreadyExists: true };
    }

    const res = await db1.raw(createQuery, [
      data.user_id,
      data.product_barcode,
    ]);

    return {
      success: true,
      likeData: {
        ...res.rows[0],
        product_info: product,
      },
    };
  }

  /**
   * ID boyicha ochirish
   */
  async delete(id: number) {
    const res = await db1.raw(deleteQuery, [id]);
    const deleted = res.rows[0];

    if (!deleted) {
      throw new NotFoundException(`Like with ID ${id} not found`);
    }

    return { success: true, deletedData: deleted };
  }
}
