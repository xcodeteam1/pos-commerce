import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { db1 } from '../../utils/dbs_config';

const getAllQuery = `
    SELECT id, description, created_at, updated_at
    FROM guest
    WHERE 1=1
  `;

const getByIdQuery = `
    SELECT id, description, created_at, updated_at
    FROM guest
    WHERE id = ?;
  `;

const createQuery = `
    INSERT INTO guest(
      guest_ip,
      description
    )
    VALUES (?, ?)
    RETURNING id, description, created_at, updated_at;
  `;

const deleteQuery = `
    DELETE FROM guest
    WHERE id = ?
    RETURNING id, description, created_at, updated_at;
  `;

@Injectable()
export class GuestRepo {
  async getAll(page: number, pageSize: number, search?: string) {
    const offset = (page - 1) * pageSize;

    let dataQuery = getAllQuery;
    let countQuery = `SELECT COUNT(*) FROM guest WHERE 1=1`;
    const params: any[] = [];
    const countParams: any[] = [];

    if (search && search.trim() !== '') {
      dataQuery += ` AND description ILIKE ?`;
      countQuery += ` AND description ILIKE ?`;
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    dataQuery += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    const totalRes = await db1.raw(countQuery, countParams);
    const totalRecords = parseInt(totalRes.rows[0].count, 10);

    const dataRes = await db1.raw(dataQuery, params);
    const guests = dataRes.rows;

    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
      data: guests,
      pagination: {
        total_records: totalRecords,
        current_page: page,
        total_pages: totalPages,
        next_page: page < totalPages ? page + 1 : null,
        prev_page: page > 1 ? page - 1 : null,
      },
    };
  }

  async getById(id: number) {
    const res = await db1.raw(getByIdQuery, [id]);
    const guest = res.rows[0];

    if (!guest) {
      throw new NotFoundException(`Guest with ID ${id} not found`);
    }
    return guest;
  }

  async create(data: { guest_ip: string; description?: string }) {
    if (!data.guest_ip) {
      throw new BadRequestException('guest_ip is required');
    }

    const checkQuery = `
      SELECT id
      FROM guest
      WHERE guest_ip = ?
      LIMIT 1;
    `;
    const existing = await db1.raw(checkQuery, [data.guest_ip]);

    if (existing.rows.length > 0) {
      return { success: true, alreadyExists: true };
    }

    const res = await db1.raw(
      `
        INSERT INTO guest(guest_ip, description)
        VALUES (?, ?)
        RETURNING id, guest_ip, description, created_at, updated_at;
      `,
      [data.guest_ip, data.description || null],
    );

    return { success: true, data: res.rows[0] };
  }

  async delete(id: number) {
    const res = await db1.raw(deleteQuery, [id]);
    if (!res.rows[0]) {
      throw new NotFoundException(`Guest with ID ${id} not found`);
    }
    return { success: true, deletedData: res.rows[0] };
  }
}
