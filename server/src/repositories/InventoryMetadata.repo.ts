import pool from "../config/poolConnection.js";
import type { InventoryMetadata } from "../controllers/stats.controller.js";
import type { RowDataPacket } from "mysql2";
export class InventoryMetadataRepo {
  
    static async getMetaData(shopId:number){
        const metadataSQL = `
        SELECT 
            -- Stock status counts
            COUNT(CASE WHEN inv.available_quantity >= inv.low_stock_threshold THEN 1 END) AS in_stock,
            COUNT(CASE WHEN inv.available_quantity < inv.low_stock_threshold THEN 1 END) AS low_stock,
            COUNT(CASE WHEN inv.available_quantity = 0 THEN 1 END) AS out_of_stock,
            
            -- Total products (quantity on hand)
            SUM(inv.quantity_on_hand) AS total_product,
            
            -- Product value calculations
            SUM(pro.selling_price * inv.available_quantity + inv.damaged_quantity * pro.selling_price * 0.80) AS total_selling_price,
            SUM(pro.cost_price * inv.available_quantity + inv.damaged_quantity * pro.cost_price * 0.80) AS total_cost_price

        FROM product_variants AS pro
        INNER JOIN inventories AS inv 
            ON pro.id = inv.product_variant_id
        INNER JOIN products as pros 
            ON pro.product_id = pros.id
        WHERE pro.shop_id = ? 
            AND inv.shop_id = ? 
            AND pro.deleted_at IS NULL 
            AND pro.is_active = true
            AND pros.deleted_at IS NULL 
            AND pro.is_active = true
            ;
        `
        const [rows] = await pool.query<RowDataPacket[]>(metadataSQL,[shopId,shopId]);
        return rows[0] as InventoryMetadata || null;
    }

    static async getDashboardMetadata(shopId:number){
        const invSQL = `
        SELECT 
            -- Stock status counts
            COUNT(CASE WHEN inv.available_quantity < inv.low_stock_threshold THEN 1 END) AS low_stock,
            
            -- Product value calculations
            SUM(pro.selling_price * inv.available_quantity + inv.damaged_quantity * pro.selling_price * 0.80) AS total_selling_price

        FROM product_variants AS pro
        INNER JOIN inventories AS inv 
            ON pro.id = inv.product_variant_id
        INNER JOIN products as pros 
            ON pro.product_id = pros.id
        WHERE pro.shop_id = ? 
            AND inv.shop_id = ? 
            AND pro.deleted_at IS NULL 
            AND pro.is_active = true
            AND pros.deleted_at IS NULL 
            AND pro.is_active = true
            ;
        `
        const revenueSql = `
            SELECT 
                COALESCE(SUM(total), 0) AS revenue
            FROM orders
            WHERE shop_id = ? AND  created_at >= NOW() - INTERVAL 30 DAY 
            AND status = 'PAID';
        `
        const total_order = `
            SELECT 
            COALESCE(count(*), 0) AS total_order
            from orders
            WHERE created_at >= NOW() - INTERVAL 1 DAY 
            AND shop_id = ?;
        `
        const [invResults] = await pool.query<RowDataPacket[]>(invSQL,[shopId,shopId]);
        const [revenueResults] = await pool.query<RowDataPacket[]>(revenueSql,[shopId]);
        const [totalOrderResults] = await pool.query<RowDataPacket[]>(total_order,[shopId]); 
        return {
            revenue:revenueResults[0]?.revenue,
            totalOrder:totalOrderResults[0]?.total_order,
            lowStockItem: invResults[0]?.low_stock,
            IventoryValues: invResults[0]?.total_selling_price,
        }

    }

}