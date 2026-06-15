// src/repositories/InventoryRepository.ts
import type { Pool, ResultSetHeader } from 'mysql2/promise';

export class InventoryRepository {
  constructor(private pool: Pool) {}

  async create(data: {
    shop_id: number;
    product_variant_id: number;
    location?: string;
    quantity_on_hand: number;
    available_quantity: number;
    low_stock_threshold: number;
  }) {
    const query = `
      INSERT INTO inventories 
      (shop_id, product_variant_id, location, quantity_on_hand, available_quantity, low_stock_threshold)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.pool.query<ResultSetHeader>(query, [
      data.shop_id,
      data.product_variant_id,
      data.location || null,
      data.quantity_on_hand,
      data.available_quantity,
      data.low_stock_threshold
    ]);
    return result.insertId;
  }
}