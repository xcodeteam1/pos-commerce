import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { db1, db2 } from '../../utils/dbs_config';

const getAllQuery = `
  SELECT *
  FROM discount
  WHERE 1=1
`;

const getByIDQuery = `
  SELECT *
  FROM discount
  WHERE id = ?;
`;

const createQuery = `
  INSERT INTO discount(
    product_barcode,
    discount_price,
    old_price,
    description
  )
  VALUES(?,?,?,?)
  RETURNING *;
`;

const deleteQuery = `
  DELETE FROM discount
  WHERE id = ?
  RETURNING *;
`;

@Injectable()
export class DiscountRepo {
  async getAll(page: number, pageSize: number, search?: string) {
    const offset = (page - 1) * pageSize;
    let barcodes: string[] = [];

    if (search && search.trim() !== '') {
      const productRes = await db2.raw(
        `SELECT barcode FROM product WHERE name ILIKE ?`,
        [`%${search}%`],
      );
      barcodes = productRes.rows.map((r: any) => r.barcode);

      if (barcodes.length === 0) {
        return { data: [], pagination: {} };
      }
    }

    let totalCountQuery = `SELECT COUNT(*) FROM discount WHERE 1=1`;
    let dataQuery = `SELECT * FROM discount WHERE 1=1`;
    const params: any[] = [];
    const countParams: any[] = [];

    if (barcodes.length > 0) {
      dataQuery += ` AND product_barcode = ANY(?)`;
      totalCountQuery += ` AND product_barcode = ANY(?)`;
      params.push(barcodes);
      countParams.push(barcodes);
    }

    dataQuery += ` ORDER BY discount_price ASC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    const totalResult = await db1.raw(totalCountQuery, countParams);
    const totalRecords = parseInt(totalResult.rows[0].count);

    const dataResult = await db1.raw(dataQuery, params);
    const discounts = dataResult.rows;

    const allBarcodes = discounts.map((d: any) => d.product_barcode);

    let productInfoMap = new Map<string, any>();
    if (allBarcodes.length > 0) {
      const productsRes = await db2.raw(
        `SELECT * FROM product WHERE barcode = ANY(?)`,
        [allBarcodes],
      );

      productInfoMap = new Map(
        productsRes.rows.map((p: any) => [p.barcode, p]),
      );
    }

    const dataWithProducts = discounts.map((d: any) => ({
      ...d,
      product_info: productInfoMap.get(d.product_barcode) || null,
    }));

    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
      data: dataWithProducts,
      pagination: {
        total_records: totalRecords,
        current_page: page,
        total_pages: totalPages,
        next_page: page < totalPages ? page + 1 : null,
        prev_page: page > 1 ? page - 1 : null,
      },
    };
  }

  async getByID(id: number) {
    const discountRes = await db1.raw(getByIDQuery, [id]);
    const discount = discountRes.rows[0];

    if (!discount)
      throw new NotFoundException(`Discount with ID ${id} not found`);

    const productRes = await db2.raw(
      `SELECT * FROM product WHERE barcode = ?`,
      [discount.product_barcode],
    );

    const product = productRes.rows[0] || null;

    return {
      ...discount,
      product,
    };
  }

  async create(data: {
    product_barcode: string;
    discount_price: number;
    old_price: number;
    description?: string;
  }) {
    const productRes = await db2.raw(
      `SELECT * FROM product WHERE barcode = ?`,
      [data.product_barcode],
    );

    if (!productRes.rows[0]) {
      throw new NotFoundException(
        `Product with barcode ${data.product_barcode} not found in product database`,
      );
    }

    const discountRes = await db1.raw(createQuery, [
      data.product_barcode,
      data.discount_price,
      data.old_price,
      data.description || null,
    ]);

    return {
      discountRes: discountRes.rows[0],
      product_info: productRes.rows[0],
    };
  }

  async update(
    id: number,
    data: {
      product_barcode?: string;
      discount_price?: number;
      old_price?: number;
      description?: string;
    },
  ) {
    const discountRes = await db1('discount').where({ id }).first();
    if (!discountRes) {
      throw new NotFoundException(`Discount with ID ${id} not found`);
    }

    if (data.product_barcode !== undefined) {
      const productRes = await db2.raw(
        `SELECT * FROM product WHERE barcode = ?`,
        [data.product_barcode],
      );

      if (!productRes.rows[0]) {
        throw new NotFoundException(
          `Product with barcode ${data.product_barcode} not found in product database`,
        );
      }
    }

    const updateData: any = {};
    if (data.product_barcode !== undefined)
      updateData.product_barcode = data.product_barcode;
    if (data.discount_price !== undefined)
      updateData.discount_price = data.discount_price;
    if (data.old_price !== undefined) updateData.old_price = data.old_price;
    if (data.description !== undefined)
      updateData.description = data.description;
    updateData.updated_at = db1.fn.now();
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const [updated] = await db1('discount')
      .where({ id })
      .update(updateData)
      .returning('*');

    return updated;
  }

  async delete(id: number) {
    const res = await db1.raw(deleteQuery, [id]);
    if (!res.rows[0]) {
      throw new NotFoundException(`Discount with ID ${id} not found`);
    }
    return { success: true, deletedData: res.rows[0] };
  }
}
