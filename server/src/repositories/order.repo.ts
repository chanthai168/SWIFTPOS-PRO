import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { CreateOrderDTO, OrderRow } from '../types/OrderType.js';

export class OrderRepository {
  constructor(private pool: Pool) {}

  async createOrder(
    conn: PoolConnection,
    shopId: number,
    cashierId: number,
    data: CreateOrderDTO,
    subtotal: number,
    total: number,
  ): Promise<number> {
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO orders
        (shop_id, cashier_id, customer_name, status, payment_method, subtotal, discount, tax, total, paid_at, notes)
       VALUES (?, ?, ?, 'PAID', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
      [
        shopId,
        cashierId,
        data.customer_name ?? null,
        data.payment_method,
        subtotal,
        data.discount ?? 0,
        data.tax ?? 0,
        total,
        data.notes ?? null,
      ],
    );
    return result.insertId;
  }

  async createOrderItem(
    conn: PoolConnection,
    orderId: number,
    item: { product_variant_id: number; quantity: number; unit_price: number },
  ): Promise<number> {
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO order_items (order_id, product_variant_id, quantity, unit_price)
       VALUES (?, ?, ?, ?)`,
      [orderId, item.product_variant_id, item.quantity, item.unit_price],
    );
    return result.insertId;
  }

  async findByShopId(
    shopId: number,
    limit: number,
    offset: number,
    sort: 'ASC' | 'DESC',
  ): Promise<OrderRow[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT
         o.*,
         COUNT(oi.id) AS item_count,
         COALESCE(SUM(oi.quantity), 0) AS product_count
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.shop_id = ?
       GROUP BY o.id
       ORDER BY o.created_at ${sort}
       LIMIT ? OFFSET ?`,
      [shopId, limit, offset],
    );
    return rows as OrderRow[];
  }

  async findById(orderId: number, shopId: number): Promise<OrderRow | null> {
    const [orders] = await this.pool.query<RowDataPacket[]>(
      `SELECT * FROM orders WHERE id = ? AND shop_id = ?`,
      [orderId, shopId],
    );
    if (!orders.length) return null;

    const [items] = await this.pool.query<RowDataPacket[]>(
      `SELECT oi.*, pv.variant_name, pv.sku
       FROM order_items oi
       JOIN product_variants pv ON pv.id = oi.product_variant_id
       WHERE oi.order_id = ?`,
      [orderId],
    );

    return { ...(orders[0] as OrderRow), items: items as OrderRow['items'] };
  }

  async countByShopId(shopId: number): Promise<number> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM orders WHERE shop_id = ?`,
      [shopId],
    );
    return Number(rows[0]?.total ?? 0);
  }
}
