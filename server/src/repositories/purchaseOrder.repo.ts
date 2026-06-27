    // src/repositories/purchaseOrder.repo.ts
    import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
    import type {
    CreatePurchaseOrderDTO,
    UpdatePurchaseOrderDTO,
    POStatus
    } from '../types/PurchaseOrderType.js';
    import { BadInputError, NotFoundError } from '../utils/appError.js';

    // Valid forward transitions. CANCELLED can be reached from DRAFT/SENT/CONFIRMED.
    const ALLOWED_TRANSITIONS: Record<POStatus, POStatus[]> = {
    DRAFT: ['SENT', 'CANCELLED'],
    SENT: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: []
    };

    export class PurchaseOrderRepository {
    constructor(private pool: Pool) {}

    async findByShopId(shopId: number, status?: string, supplierId?: number) {
        let query = `
        SELECT po.id, po.shop_id, po.supplier_id, s.name AS supplier_name,
                po.created_by_user_id, po.status, po.order_date, po.expected_delivery_date,
                po.total_cost, po.notes, po.created_at, po.updated_at,
                (SELECT COUNT(*) FROM purchase_order_items poi WHERE poi.purchase_order_id = po.id) AS item_count
        FROM purchase_orders po
        JOIN suppliers s ON s.id = po.supplier_id
        WHERE po.shop_id = ?
        `;
        const params: (number | string)[] = [shopId];

        if (status) {
        query += ` AND po.status = ?`;
        params.push(status);
        }
        if (supplierId) {
        query += ` AND po.supplier_id = ?`;
        params.push(supplierId);
        }

        query += ` ORDER BY po.created_at DESC`;

        const [rows] = await this.pool.query<RowDataPacket[]>(query, params);
        return rows;
    }

    async findById(shopId: number, poId: number) {
        const [poRows] = await this.pool.query<RowDataPacket[]>(
        `SELECT po.id, po.shop_id, po.supplier_id, s.name AS supplier_name, s.lead_time_days,
                po.created_by_user_id, po.status, po.order_date, po.expected_delivery_date,
                po.total_cost, po.notes, po.created_at, po.updated_at
        FROM purchase_orders po
        JOIN suppliers s ON s.id = po.supplier_id
        WHERE po.id = ? AND po.shop_id = ?`,
        [poId, shopId]
        );

        const po = poRows[0];
        if (!po) return null;

        const [items] = await this.pool.query<RowDataPacket[]>(
        `SELECT poi.id, poi.product_variant_id, pv.sku, pv.variant_name, p.name AS product_name,
                poi.quantity, poi.unit_cost, poi.total_cost
        FROM purchase_order_items poi
        JOIN product_variants pv ON pv.id = poi.product_variant_id
        JOIN products p ON p.id = pv.product_id
        WHERE poi.purchase_order_id = ?`,
        [poId]
        );

        return { ...po, items };
    }

    async create(shopId: number, userId: number, data: CreatePurchaseOrderDTO) {
        const conn = await this.pool.getConnection();
        try {
        await conn.beginTransaction();

        const [poResult] = await conn.query<ResultSetHeader>(
            `INSERT INTO purchase_orders
            (shop_id, supplier_id, created_by_user_id, status, order_date, expected_delivery_date, notes)
            VALUES (?, ?, ?, 'DRAFT', ?, ?, ?)`,
            [shopId, data.supplier_id, userId, data.order_date, data.expected_delivery_date || null, data.notes || null]
        );
        const poId = poResult.insertId;

        let total = 0;
        for (const item of data.items) {
            if (item.quantity <= 0) throw new BadInputError('Item quantity must be greater than 0');
            if (item.unit_cost < 0) throw new BadInputError('Item unit cost cannot be negative');

            await conn.query(
            `INSERT INTO purchase_order_items (purchase_order_id, product_variant_id, quantity, unit_cost)
            VALUES (?, ?, ?, ?)`,
            [poId, item.product_variant_id, item.quantity, item.unit_cost]
            );
            total += item.quantity * item.unit_cost;
        }

        await conn.query(`UPDATE purchase_orders SET total_cost = ? WHERE id = ?`, [total, poId]);

        await conn.commit();
        return poId;
        } catch (error) {
        await conn.rollback();
        throw error;
        } finally {
        conn.release();
        }
    }

    async update(shopId: number, data: UpdatePurchaseOrderDTO) {
        const conn = await this.pool.getConnection();
        try {
        await conn.beginTransaction();

        const [existingRows] = await conn.query<RowDataPacket[]>(
            `SELECT status FROM purchase_orders WHERE id = ? AND shop_id = ? FOR UPDATE`,
            [data.id, shopId]
        );
        const existing = existingRows[0];
        if (!existing) throw new NotFoundError(`Purchase order ${data.id} not found`);
        if (existing.status !== 'DRAFT') {
            throw new BadInputError('Only DRAFT purchase orders can be edited');
        }

        const updateFields: string[] = [];
        const params: any[] = [];
        if (data.supplier_id !== undefined) { updateFields.push('supplier_id = ?'); params.push(data.supplier_id); }
        if (data.order_date !== undefined) { updateFields.push('order_date = ?'); params.push(data.order_date); }
        if (data.expected_delivery_date !== undefined) { updateFields.push('expected_delivery_date = ?'); params.push(data.expected_delivery_date); }
        if (data.notes !== undefined) { updateFields.push('notes = ?'); params.push(data.notes); }

        if (updateFields.length > 0) {
            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            await conn.query(
            `UPDATE purchase_orders SET ${updateFields.join(', ')} WHERE id = ? AND shop_id = ?`,
            [...params, data.id, shopId]
            );
        }

        if (data.items) {
            await conn.query(`DELETE FROM purchase_order_items WHERE purchase_order_id = ?`, [data.id]);

            let total = 0;
            for (const item of data.items) {
            if (item.quantity <= 0) throw new BadInputError('Item quantity must be greater than 0');
            if (item.unit_cost < 0) throw new BadInputError('Item unit cost cannot be negative');

            await conn.query(
                `INSERT INTO purchase_order_items (purchase_order_id, product_variant_id, quantity, unit_cost)
                VALUES (?, ?, ?, ?)`,
                [data.id, item.product_variant_id, item.quantity, item.unit_cost]
            );
            total += item.quantity * item.unit_cost;
            }
            await conn.query(`UPDATE purchase_orders SET total_cost = ? WHERE id = ?`, [total, data.id]);
        }

        await conn.commit();
        return true;
        } catch (error) {
        await conn.rollback();
        throw error;
        } finally {
        conn.release();
        }
    }

    // Transitions status. When moving to DELIVERED, stocks the inventory and logs it.
    async updateStatus(shopId: number, userId: number, poId: number, newStatus: POStatus) {
        const conn = await this.pool.getConnection();
        try {
        await conn.beginTransaction();

        const [rows] = await conn.query<RowDataPacket[]>(
            `SELECT status FROM purchase_orders WHERE id = ? AND shop_id = ? FOR UPDATE`,
            [poId, shopId]
        );
        const po = rows[0];
        if (!po) throw new NotFoundError(`Purchase order ${poId} not found`);

        const currentStatus = po.status as POStatus;
        if (!ALLOWED_TRANSITIONS[currentStatus].includes(newStatus)) {
            throw new BadInputError(`Cannot move purchase order from ${currentStatus} to ${newStatus}`);
        }

        await conn.query(
            `UPDATE purchase_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [newStatus, poId]
        );

        if (newStatus === 'DELIVERED') {
            const [items] = await conn.query<RowDataPacket[]>(
            `SELECT product_variant_id, quantity FROM purchase_order_items WHERE purchase_order_id = ?`,
            [poId]
            );

            for (const item of items) {
            const [invRows] = await conn.query<RowDataPacket[]>(
                `SELECT id FROM inventories WHERE shop_id = ? AND product_variant_id = ? LIMIT 1`,
                [shopId, item.product_variant_id]
            );

            let inventoryId: number;
            if (invRows[0]) {
                inventoryId = invRows[0].id;
                await conn.query(
                `UPDATE inventories
                SET quantity_on_hand = quantity_on_hand + ?, available_quantity = available_quantity + ?
                WHERE id = ?`,
                [item.quantity, item.quantity, inventoryId]
                );
            } else {
                const [insertResult] = await conn.query<ResultSetHeader>(
                `INSERT INTO inventories (shop_id, product_variant_id, quantity_on_hand, available_quantity)
                VALUES (?, ?, ?, ?)`,
                [shopId, item.product_variant_id, item.quantity, item.quantity]
                );
                inventoryId = insertResult.insertId;
            }

            await conn.query(
                `INSERT INTO inventory_logs (inventory_id, shop_id, user_id, type, description, change_amount)
                VALUES (?, ?, ?, 'RESTOCK', ?, ?)`,
                [inventoryId, shopId, userId, `Received from PO #${poId}`, item.quantity]
            );
            }
        }

        await conn.commit();
        return true;
        } catch (error) {
        await conn.rollback();
        throw error;
        } finally {
        conn.release();
        }
    }

    async remove(shopId: number, poId: number) {
        const [rows] = await this.pool.query<RowDataPacket[]>(
        `SELECT status FROM purchase_orders WHERE id = ? AND shop_id = ?`,
        [poId, shopId]
        );
        const po = rows[0];
        if (!po) throw new NotFoundError(`Purchase order ${poId} not found`);
        if (po.status !== 'DRAFT') {
        throw new BadInputError('Only DRAFT purchase orders can be deleted');
        }

        const [result] = await this.pool.query<ResultSetHeader>(
        `DELETE FROM purchase_orders WHERE id = ? AND shop_id = ?`,
        [poId, shopId]
        );
        return result;
    }
    }