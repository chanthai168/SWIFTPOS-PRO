import type { Pool } from 'mysql2/promise';
import { OrderRepository } from '../repositories/order.repo.js';
import { InventoryRepository } from '../repositories/ineventory.repo.js';
import { HistoryRepository } from '../repositories/history.repo.js';
import type { CreateOrderDTO } from '../types/OrderType.js';
import { BadInputError, NotFoundError } from '../utils/appError.js';

export class OrderService {
  constructor(
    private pool: Pool,
    private orderRepo: OrderRepository,
    private inventoryRepo: InventoryRepository,
    private historyRepo: HistoryRepository,
  ) {}

  async createOrder(
    shopId: number,
    cashierId: number,
    data: CreateOrderDTO,
  ) {
    if (!data.items?.length) {
      throw new BadInputError('Order must contain at least one item');
    }

    const subtotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );
    const total = subtotal - (data.discount ?? 0) + (data.tax ?? 0);

    if (total < 0) {
      throw new BadInputError('Order total cannot be negative');
    }

    const conn = await this.pool.getConnection();

    try {
      await conn.beginTransaction();

      for (const item of data.items) {
        if (item.quantity <= 0) {
          throw new BadInputError('Item quantity must be greater than zero');
        }

        const inventory = await this.inventoryRepo.findByVariantId(
          conn,
          shopId,
          item.product_variant_id,
        );

        if (!inventory) {
          throw new NotFoundError(`Inventory not found for variant ${item.product_variant_id}`);
        }

        if (Number(inventory.available_quantity) < item.quantity) {
          throw new BadInputError(
            `Insufficient stock for variant ${item.product_variant_id}. Available: ${inventory.available_quantity}`,
          );
        }
      }

      const orderId = await this.orderRepo.createOrder(
        conn,
        shopId,
        cashierId,
        data,
        subtotal,
        total,
      );

      for (const item of data.items) {
        await this.orderRepo.createOrderItem(conn, orderId, item);

        const inventory = await this.inventoryRepo.findByVariantId(
          conn,
          shopId,
          item.product_variant_id,
        );

        const affected = await this.inventoryRepo.deductStock(
          conn,
          inventory!.id as number,
          item.quantity,
        );

        if (!affected) {
          throw new BadInputError(`Failed to deduct stock for variant ${item.product_variant_id}`);
        }

        await this.inventoryRepo.createLog(conn, {
          inventory_id: inventory!.id as number,
          shop_id: shopId,
          user_id: cashierId,
          type: 'OUT',
          description: `POS sale — Order #${orderId}`,
          change_amount: -item.quantity,
        });
      }

      await this.inventoryRepo.createAuditLog(conn, {
        shop_id: shopId,
        user_id: cashierId,
        entity_type: 'ORDER',
        entity_id: orderId,
        action: 'SALE',
        details: {
          subtotal,
          discount: data.discount ?? 0,
          tax: data.tax ?? 0,
          total,
          payment_method: data.payment_method,
          item_count: data.items.length,
        },
      });

      await conn.commit();

      return this.orderRepo.findById(orderId, shopId);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async getOrders(
    shopId: number,
    limit = 20,
    offset = 0,
    sort: 'ASC' | 'DESC' = 'DESC',
  ) {
    const [orders, total] = await Promise.all([
      this.orderRepo.findByShopId(shopId, limit, offset, sort),
      this.orderRepo.countByShopId(shopId),
    ]);
    return { orders, total };
  }

  async getInventoryHistory(
    shopId: number,
    limit = 10,
    offset = 0,
    sort: 'ASC' | 'DESC' = 'DESC',
  ) {
    const [logs, total] = await Promise.all([
      this.historyRepo.getInventoryLogs(shopId, limit, offset, sort),
      this.historyRepo.countInventoryLogs(shopId),
    ]);
    return { logs, total };
  }

  async getSupplyHistory(
    shopId: number,
    limit = 10,
    offset = 0,
    sort: 'ASC' | 'DESC' = 'DESC',
  ) {
    const [orders, total] = await Promise.all([
      this.historyRepo.getSupplyOrders(shopId, limit, offset, sort),
      this.historyRepo.countSupplyOrders(shopId),
    ]);
    return { orders, total };
  }
}
