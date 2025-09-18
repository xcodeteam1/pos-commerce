import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { db1, db2 } from '../../utils/dbs_config';

const getAllQuery = `
    SELECT id, guest_id, product_barcode, created_at
    FROM liked
    WHERE guest_id = ?
  `;

const getByIdQuery = `
    SELECT id, guest_id, product_barcode, created_at
    FROM liked
    WHERE id = ?;
  `;

const createQuery = `
    INSERT INTO liked(
      guest_id,
      product_barcode
    )
    VALUES (?, ?)
    RETURNING id, guest_id, product_barcode, created_at;
  `;

const deleteQuery = `
    DELETE FROM liked
    WHERE id = ?
    RETURNING id, guest_id, product_barcode, created_at;
  `;

@Injectable()
export class LikedRepo {
  /**
   * guest_id boyicha barcha like’larni olish (product ma’lumotlari bilan)
   */
  async getAllByGuest(
    guestId: number,
    page = 1,
    pageSize = 10,
    search?: string,
  ) {
    const offset = (page - 1) * pageSize;

    // Like’lar sonini hisoblash (agar search bo‘lsa shart bilan)
    let totalCountRes;
    let likesRes;

    if (search && search.trim() !== '') {
      const fullText = search;
      const ilike = `%${search}%`;

      totalCountRes = await db1.raw(
        `
        SELECT COUNT(*) 
        FROM liked l
        JOIN product p ON p.barcode = l.product_barcode
        WHERE l.guest_id = ?
          AND (
            to_tsvector('simple', p.name) @@ plainto_tsquery(?)
            OR p.name ILIKE ?
            OR p.barcode ILIKE ?
          )
        `,
        [guestId, fullText, ilike, ilike],
      );

      likesRes = await db1.raw(
        `
        SELECT l.*, p.name AS product_name
        FROM liked l
        JOIN product p ON p.barcode = l.product_barcode
        WHERE l.guest_id = ?
          AND (
            to_tsvector('simple', p.name) @@ plainto_tsquery(?)
            OR p.name ILIKE ?
            OR p.barcode ILIKE ?
          )
        ORDER BY l.created_at DESC
        LIMIT ? OFFSET ?
        `,
        [guestId, fullText, ilike, ilike, pageSize, offset],
      );
    } else {
      totalCountRes = await db1.raw(
        `SELECT COUNT(*) FROM liked WHERE guest_id = ?`,
        [guestId],
      );

      likesRes = await db1.raw(
        `
        SELECT * 
        FROM liked
        WHERE guest_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        `,
        [guestId, pageSize, offset],
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

    // product barcodelarini yig‘amiz
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
   * like ID boyicha olish (product ma’lumotlari bilan)
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
   * guest biror product’ga like bosadi
   * agar shu product allaqachon like qilingan bolsa, yangisini yaratmaydi
   */
  async create(data: { guest_id: number; product_barcode: string }) {
    if (!data.guest_id) {
      throw new BadRequestException('guest_id is required');
    }
    if (!data.product_barcode || data.product_barcode.trim() === '') {
      throw new BadRequestException('product_barcode is required');
    }

    // avval product mavjudligini tekshiramiz
    const productRes = await db2.raw(
      `SELECT * FROM product WHERE barcode = ?`,
      [data.product_barcode],
    );
    const product = productRes.rows[0];
    if (!product) {
      throw new NotFoundException(
        `Product with barcode ${data.product_barcode} not found in product database`,
      );
    }

    // shu guest ushbu product’ni like qilganmi — tekshiramiz
    const checkQuery = `
        SELECT id
        FROM liked
        WHERE guest_id = ? AND product_barcode = ?
        LIMIT 1;
      `;
    const existing = await db1.raw(checkQuery, [
      data.guest_id,
      data.product_barcode,
    ]);

    if (existing.rows.length > 0) {
      return { success: true, alreadyExists: true };
    }

    // agar yoq bolsa — yangi yozuv yaratamiz
    const res = await db1.raw(createQuery, [
      data.guest_id,
      data.product_barcode,
    ]);

    return {
      success: true,
      data: {
        ...res.rows[0],
        product_info: product,
      },
    };
  }

  /**
   * like ID boyicha ochirish
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
