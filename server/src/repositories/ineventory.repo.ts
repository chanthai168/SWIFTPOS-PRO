// src/repositories/InventoryRepository.ts
import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

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

  async findByVariantId(
    conn: PoolConnection,
    shopId: number,
    variantId: number,
  ) {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM inventories WHERE shop_id = ? AND product_variant_id = ? FOR UPDATE`,
      [shopId, variantId],
    );
    return rows[0] ?? null;
  }

  async deductStock(
    conn: PoolConnection,
    inventoryId: number,
    quantity: number,
  ) {
    const [result] = await conn.query<ResultSetHeader>(
      `UPDATE inventories
       SET quantity_on_hand = quantity_on_hand - ?,
           available_quantity = available_quantity - ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND available_quantity >= ?`,
      [quantity, quantity, inventoryId, quantity],
    );
    return result.affectedRows;
  }

  async createLog(
    conn: PoolConnection,
    data: {
      inventory_id: number;
      shop_id: number;
      user_id: number;
      type: 'IN' | 'OUT' | 'ADJUST' | 'DAMAGE' | 'RESTOCK';
      description: string;
      change_amount: number;
    },
  ) {
    await conn.query(
      `INSERT INTO inventory_logs (inventory_id, shop_id, user_id, type, description, change_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.inventory_id,
        data.shop_id,
        data.user_id,
        data.type,
        data.description,
        data.change_amount,
      ],
    );
  }

  async createAuditLog(
    conn: PoolConnection,
    data: {
      shop_id: number;
      user_id: number;
      entity_type: 'ORDER' | 'PURCHASE_ORDER' | 'INVENTORY' | 'PRODUCT';
      entity_id: number;
      action: string;
      details?: Record<string, unknown>;
    },
  ) {
    await conn.query(
      `INSERT INTO audit_logs (shop_id, user_id, entity_type, entity_id, action, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.shop_id,
        data.user_id,
        data.entity_type,
        data.entity_id,
        data.action,
        data.details ? JSON.stringify(data.details) : null,
      ],
    );
  }
}