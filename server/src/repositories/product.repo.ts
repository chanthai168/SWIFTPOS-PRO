// src/repositories/ProductRepository.ts
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { ProductUpdateDTO } from '../types/ProductType.js';
import { BadInputError } from '../utils/appError.js';


export class ProductRepository {
  constructor(private pool: Pool) {}

  async findByShopId(shopId: number, search?: string) {
    let query = `
      SELECT p.id, p.name, p.description, p.sku, p.is_active, p.created_at,
             c.id as category_id, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.shop_id = ? AND p.deleted_at IS NULL
    `;
    const params: (number | string)[] = [shopId];

    if (search) {
      query += ` AND (p.name LIKE ? OR p.sku LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ` ORDER BY p.created_at DESC`;

    const [rows] = await this.pool.query<RowDataPacket[]>(query, params);
    return rows;
  }

  async getProductWithVariant(
    shop_id: number,
    limit: number,
    offset: number,
    filter: {filter:string,order:string},
    category_id?: number
  ) {

    let sql = `
      SELECT * FROM product_catalog 
      WHERE shop_id = ?
    `;

    const params: any[] = [shop_id];

    // Add category filter if provided
    if (category_id) {
      sql += ` AND category_id = ?`;
      params.push(category_id);
    }

    sql += ` ORDER BY ${filter.filter} ${filter.order}`;

    // Add pagination
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute query (example with mysql2)
    let finalSQL = `
    SELECT * FROM product_catalog
    WHERE product_id IN (
        SELECT product_id FROM (
            ${sql}
        ) AS subq
    );
    `
    const [rows,fields] = await this.pool.query(finalSQL, params);
    
    return rows;
  }

  async create(shopId: number, data: {
    name: string;
    description?: string;
    category_id?: number | null;
    is_active?: boolean;
  }) {
    const query = `
      INSERT INTO products (shop_id, name, description, category_id, is_active)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await this.pool.query<ResultSetHeader>(query, [
      shopId,
      data.name,
      data.description || null,
      data.category_id || null,
      data.is_active ?? true
    ]);
    return result.insertId;
  }

  async update(data: ProductUpdateDTO): Promise<any> {
    const updateFields: string[] = [];
    const params: any[] = [];
    
    if (data.name !== undefined) {
      updateFields.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      updateFields.push('description = ?');
      params.push(data.description);
    }
    if (data.is_active !== undefined) {
      updateFields.push('is_active = ?');
      params.push(data.is_active);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    const sql = `
      UPDATE products 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    params.push(data.id);
    
    const [result] = await this.pool.query<ResultSetHeader>(sql, params);
    
    if (result.affectedRows === 0) {
      throw new BadInputError(`Product with id ${data.id} not found`);
    }
    return result;
  }

  async updateCategory(productId: number, categoryId: number | null) {
    const query = `
      UPDATE products 
      SET category_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await this.pool.query(query, [categoryId, productId]);
  }

  async findById(productId: number) {
    const [rows] = await this.pool.query<RowDataPacket[]>(`
      SELECT * FROM products WHERE id = ? AND deleted_at IS NULL
    `, [productId]);
    return rows[0] || null;
  }

  async softDelete(productId: number) {
    await this.pool.query(`
      UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [productId]);
  }
}