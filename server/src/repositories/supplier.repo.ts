    import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
    import type { CreateSupplierDTO, SupplierUpdateDTO } from '../types/SupplierType.js';
    import { BadInputError } from '../utils/appError.js';

    export class SupplierRepository {
    constructor(private pool: Pool) {}

    async findByShopId(shopId: number, search?: string, activeOnly?: boolean) {
        let query = `
        SELECT id, shop_id, name, contact_person, phone, email, address,
                lead_time_days, is_active, created_at, updated_at
        FROM suppliers
        WHERE shop_id = ?
        `;
        const params: (number | string)[] = [shopId];

        if (search) {
        query += ` AND (name LIKE ? OR contact_person LIKE ? OR email LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
        }

        if (activeOnly) {
        query += ` AND is_active = 1`;
        }

        query += ` ORDER BY name ASC`;

        const [rows] = await this.pool.query<RowDataPacket[]>(query, params);
        return rows;
    }

    async findById(shopId: number, supplierId: number) {
        const [rows] = await this.pool.query<RowDataPacket[]>(
        `SELECT id, shop_id, name, contact_person, phone, email, address,
                lead_time_days, is_active, created_at, updated_at
        FROM suppliers
        WHERE id = ? AND shop_id = ?`,
        [supplierId, shopId]
        );
        return rows[0] || null;
    }

    async create(shopId: number, data: CreateSupplierDTO) {
        const query = `
        INSERT INTO suppliers (shop_id, name, contact_person, phone, email, address, lead_time_days, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await this.pool.query<ResultSetHeader>(query, [
        shopId,
        data.name,
        data.contact_person || null,
        data.phone || null,
        data.email || null,
        data.address || null,
        data.lead_time_days ?? 3,
        data.is_active ?? true
        ]);
        return result.insertId;
    }

    async update(shopId: number, data: SupplierUpdateDTO) {
        const updateFields: string[] = [];
        const params: any[] = [];

        if (data.name !== undefined) { updateFields.push('name = ?'); params.push(data.name); }
        if (data.contact_person !== undefined) { updateFields.push('contact_person = ?'); params.push(data.contact_person); }
        if (data.phone !== undefined) { updateFields.push('phone = ?'); params.push(data.phone); }
        if (data.email !== undefined) { updateFields.push('email = ?'); params.push(data.email); }
        if (data.address !== undefined) { updateFields.push('address = ?'); params.push(data.address); }
        if (data.lead_time_days !== undefined) { updateFields.push('lead_time_days = ?'); params.push(data.lead_time_days); }
        if (data.is_active !== undefined) { updateFields.push('is_active = ?'); params.push(data.is_active); }

        if (updateFields.length === 0) {
        throw new BadInputError('No fields provided to update');
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');

        const sql = `UPDATE suppliers SET ${updateFields.join(', ')} WHERE id = ? AND shop_id = ?`;
        params.push(data.id, shopId);

        const [result] = await this.pool.query<ResultSetHeader>(sql, params);
        if (result.affectedRows === 0) {
        throw new BadInputError(`Supplier with id ${data.id} not found`);
        }
        return result;
    }

    async deactivate(shopId: number, supplierId: number) {
        const [result] = await this.pool.query<ResultSetHeader>(
        `UPDATE suppliers SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND shop_id = ?`,
        [supplierId, shopId]
        );
        if (result.affectedRows === 0) throw new BadInputError(`Supplier with id ${supplierId} not found`);
        return result;
    }

    async remove(shopId: number, supplierId: number) {
        const [result] = await this.pool.query<ResultSetHeader>(
        `DELETE FROM suppliers WHERE id = ? AND shop_id = ?`,
        [supplierId, shopId]
        );
        if (result.affectedRows === 0) throw new BadInputError(`Supplier with id ${supplierId} not found`);
        return result;
    }
    }