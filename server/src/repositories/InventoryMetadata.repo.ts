import pool from "../config/poolConnection.js";
import type { InventoryMetadata } from "../controllers/inventoryMetadata.controller.js";
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
        WHERE pro.shop_id = ? 
            AND inv.shop_id = ?;
        `
        const [rows] = await pool.query<RowDataPacket[]>(metadataSQL,[shopId,shopId]);
        return rows[0] as InventoryMetadata || null;
    }

}