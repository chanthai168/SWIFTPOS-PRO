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

    const allowedFilters = ['selling_price', 'cost_price', 'created_at', 'name'];
    if (filter.filter && !allowedFilters.includes(filter.filter)) {
      throw new BadInputError(`filter must be one of: ${allowedFilters.join(', ')}`);
    }

    const sortFieldMap: Record<string, string> = {
      selling_price: 'var.selling_price',
      cost_price: 'var.cost_price',
      created_at: 'p.created_at',
      name: 'p.name',
    };

    const sortField = sortFieldMap[filter.filter] ?? 'p.created_at';
    const sortDirection = filter.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let sql = `
      SELECT
        p.shop_id,
        p.id AS product_id,
        p.name,
        p.description,
        p.is_active,
        c.id AS category_id,
        c.name AS category,
        c.description AS category_des,
        img.id AS image_id,
        img.image_url,
        img.file_name,
        img.file_size,
        img.mimetype,
        var.id AS variant_id,
        var.product_image_id,
        var.sku,
        var.variant_name,
        var.cost_price,
        var.selling_price,
        var.created_at,
        var.updated_at,
        inv.id AS inventory_id,
        inv.location,
        inv.quantity_on_hand,
        inv.available_quantity,
        inv.damaged_quantity,
        inv.low_stock_threshold,
        inv.last_audited,
        inv.created_at AS inv_created_at,
        inv.updated_at AS inv_updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants var ON p.id = var.product_id
      LEFT JOIN product_images img ON var.product_image_id = img.id
      LEFT JOIN inventories inv ON var.id = inv.product_variant_id
      WHERE p.shop_id = ? AND p.deleted_at IS NULL
    `;

    const params: any[] = [shop_id];

    if (category_id) {
      sql += ` AND p.category_id = ?`;
      params.push(category_id);
    }

    sql += ` ORDER BY ${sortField} ${sortDirection}`;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await this.pool.query<RowDataPacket[]>(sql, params);
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