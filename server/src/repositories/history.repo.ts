import type { Pool, RowDataPacket } from 'mysql2/promise';

export class HistoryRepository {
  constructor(private pool: Pool) {}

  async getInventoryLogs(
    shopId: number,
    limit: number,
    offset: number,
    sort: 'ASC' | 'DESC',
  ) {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT
         il.id,
         il.type,
         il.description,
         il.change_amount,
         il.created_at,
         p.name AS product_name,
         pv.variant_name,
         pv.sku,
         inv.available_quantity
       FROM inventory_logs il
       JOIN inventories inv ON inv.id = il.inventory_id
       JOIN product_variants pv ON pv.id = inv.product_variant_id
       JOIN products p ON p.id = pv.product_id
       WHERE il.shop_id = ?
       ORDER BY il.created_at ${sort}
       LIMIT ? OFFSET ?`,
      [shopId, limit, offset],
    );
    return rows;
  }

  async countInventoryLogs(shopId: number): Promise<number> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM inventory_logs WHERE shop_id = ?`,
      [shopId],
    );
    return Number(rows[0]?.total ?? 0);
  }

  async getSupplyOrders(
    shopId: number,
    limit: number,
    offset: number,
    sort: 'ASC' | 'DESC',
  ) {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT
         po.id,
         po.status,
         po.order_date,
         po.expected_delivery_date,
         po.total_cost,
         po.notes,
         po.created_at,
         s.name AS supplier_name,
         COUNT(poi.id) AS item_count,
         COALESCE(SUM(poi.quantity), 0) AS product_count
       FROM purchase_orders po
       JOIN suppliers s ON s.id = po.supplier_id
       LEFT JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
       WHERE po.shop_id = ?
       GROUP BY po.id
       ORDER BY po.created_at ${sort}
       LIMIT ? OFFSET ?`,
      [shopId, limit, offset],
    );
    return rows;
  }

  async countSupplyOrders(shopId: number): Promise<number> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM purchase_orders WHERE shop_id = ?`,
      [shopId],
    );
    return Number(rows[0]?.total ?? 0);
  }
}
