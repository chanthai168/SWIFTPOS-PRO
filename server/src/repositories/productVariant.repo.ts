// src/repositories/ProductVariantRepository.ts
import type { Pool, QueryResult, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { VariantUpdateDTO } from '../types/ProductType.js';
import { UnauthorizedError } from 'express-oauth2-jwt-bearer';
import { BadInputError } from '../utils/appError.js';
export class ProductVariantRepository {
  constructor(private pool: Pool) {}

  async isValidedAuthority(shopId:number,productId:number){
    const query = `
      SELECT * FROM products 
      WHERE shop_id = ? and id = ?;
    `
    const [results] = await this.pool.query<RowDataPacket[]>(query,[shopId,productId]);
    return results.length != 0;
  }

  async create(shopId: number, data: {
    product_id: number;
    product_image_id?: number;
    sku: string;
    variant_name: string;
    cost_price: number;
    selling_price: number;
  }) {
    const query = `
      INSERT INTO product_variants 
      (shop_id, product_id, product_image_id, sku, variant_name, cost_price, selling_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.pool.query<ResultSetHeader>(query, [
      shopId,
      data.product_id,
      data.product_image_id || null,
      data.sku,
      data.variant_name,
      data.cost_price,
      data.selling_price
    ]);
    return result.insertId;
  }

  async findByProductId(productId: number) {
    const [rows] = await this.pool.query<RowDataPacket[]>(`
      SELECT sku,variant_name,cost_price,selling_price,pro.created_at,updated_at,
        image_url,file_name,file_size,mimetype
        FROM product_variants AS pro
        LEFT JOIN product_images AS pro_img
        ON pro.product_image_id = pro_img.id
        WHERE product_id = ?
        ORDER BY pro.created_at ASC;
    `, [productId]);
    return rows;
  }

  async checkSkuExists(shopId: number, sku: string, excludeVariantId?: number) {
    let query = `SELECT id FROM product_variants WHERE shop_id = ? AND sku = ?`;
    const params: (number | string)[] = [shopId, sku];
    
    if (excludeVariantId) {
      query += ` AND id != ?`;
      params.push(excludeVariantId);
    }

    const [rows] = await this.pool.query<RowDataPacket[]>(query, params);
    return rows.length > 0;
  }


  async update(
    shopId: number, 
    productId: number, 
    variants: VariantUpdateDTO[]
  ): Promise<RowDataPacket[]> {   // ← Return updated variants

    if (!(await this.isValidedAuthority(shopId, productId))) {
      throw new UnauthorizedError('Access denied');
    }

    if (!variants?.length) {
      return [];
    }

    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();

      for (const v of variants) {
        // Convert string values to proper numbers
        const costPrice = parseFloat(v.cost_price);
        const sellingPrice = parseFloat(v.selling_price);
        const qtyOnHand = parseInt(v.quantity_on_hand, 10);
        const damagedQty = parseInt(String(v.damaged_quantity), 10);
        const lowStock = parseInt(v.low_stock_threshold, 10);

        if (isNaN(costPrice) 
          || isNaN(sellingPrice) 
          || isNaN(qtyOnHand)
          || isNaN(damagedQty)
          || isNaN(lowStock)
        ) {
          throw new Error(`Invalid numeric value`);
        }

        // 1. Update product_variants
        const [variantResult] = await connection.execute<ResultSetHeader>(
          `UPDATE product_variants 
          SET variant_name = ?, sku = ?, cost_price = ?, selling_price = ?
          WHERE id = ? AND shop_id = ? AND product_id = ?`,
          [v.variant_name, v.sku, costPrice, sellingPrice, v.id, shopId, productId]
        );
        if (variantResult.affectedRows === 0) {
          throw new BadInputError(`Variant ${v.id} not found for this product`);
        }

        // 2. Update inventories
        const [inventoryResult] = await connection.execute<ResultSetHeader>(
          `UPDATE inventories 
          SET location = ?, 
              quantity_on_hand = ?, 
              available_quantity = ?, 
              damaged_quantity = ?, 
              low_stock_threshold = ?
          WHERE id = ? AND shop_id = ? AND product_variant_id = ?`,
          [v.location, qtyOnHand, qtyOnHand - damagedQty, damagedQty, lowStock, 
          v.inventory_id, shopId, v.id]
        );
        if (inventoryResult.affectedRows === 0) {
          throw new BadInputError(`Inventory ${v.inventory_id} not found for variant ${v.id}`);
        }
      }

      await connection.commit();

      // === Fetch and return the updated variants ===
      const updatedVariants = await this.getVariantsByIds(
        shopId, 
        productId, 
        variants.map(v => v.id)
      );

      return updatedVariants;

    } catch (error: any) {
      await connection.rollback();
      console.error('Variant update failed:', error.message);
      if(error.message === 'Invalid numeric value'){
        throw new BadInputError('Invalid numeric input or access denied');
      }
      throw new Error(`Failed to update variants: ${error.message}`);
    } finally {
      connection.release();
    }
  }
  private async getVariantsByIds(shopId: number, productId: number, variantIds: number[]) {
  if (!variantIds.length) return [];

  const [rows] = await this.pool.query<RowDataPacket[]>(
    `SELECT 
       pv.id,
       pv.variant_name,
       pv.sku,
       pv.cost_price,
       pv.selling_price,
       i.id as inventory_id,
       i.location,
       i.quantity_on_hand,
       i.available_quantity,
       i.damaged_quantity,
       i.low_stock_threshold
     FROM product_variants pv
     JOIN inventories i ON i.product_variant_id = pv.id
     WHERE pv.shop_id = ? 
       AND pv.product_id = ? 
       AND pv.id IN (?)`,
    [shopId, productId, variantIds]
  );

  return rows;
  }
}
