// src/repositories/CategoryRepository.ts
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export class CategoryRepository {
  constructor(private pool: Pool) {}

  async findByShopId(shopId: number) {
    const [rows] = await this.pool.query<RowDataPacket[]>(`
      SELECT id, name, description
      FROM categories
      WHERE shop_id = ?
      ORDER BY name ASC
    `, [shopId]);
    return rows;
  }

  async create(shopId: number, data: { name: string; description?: string }) {
    const query = `
      INSERT INTO categories (shop_id, name, description)
      VALUES (?, ?, ?)
    `;
    const [result] = await this.pool.query<ResultSetHeader>(query, [
      shopId,
      data.name,
      data.description || null
    ]);
    return result.insertId;
  }

  async findById(categoryId: number, shopId: number) {
    const [rows] = await this.pool.query<RowDataPacket[]>(`
      SELECT * FROM categories WHERE id = ? AND shop_id = ?
    `, [categoryId, shopId]);
    return rows[0] || null;
  }
}