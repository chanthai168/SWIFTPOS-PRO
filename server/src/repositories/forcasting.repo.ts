import type { RowDataPacket } from "mysql2";
import pool from "../config/poolConnection.js";
export class ForcastingRepo {
    static async getLowStockItem (shop_id:number){
        const sql = `
        SELECT 
            p.id AS product_id,
            p.name AS product_name,
            pv.id AS variant_id,
            pv.variant_name,
            pv.sku AS variant_sku,
            pv.selling_price,
            pv.cost_price,
            
            pi.image_url,
            pi.created_at as image_created_at,
            
            inv.id AS inventory_id,
            inv.location,
            inv.quantity_on_hand,
            inv.available_quantity,
            inv.low_stock_threshold,
            inv.damaged_quantity,
            c.name AS category_name,
            -- Stock status using < (strictly less than threshold)
            CASE 
                WHEN inv.available_quantity < inv.low_stock_threshold AND inv.available_quantity > 0 THEN 'LOW STOCK'
                WHEN inv.available_quantity = 0 THEN 'OUT OF STOCK'
                ELSE 'OK'
            END AS stock_status,
            -- Suggested reorder quantity
            CASE 
                WHEN inv.available_quantity < inv.low_stock_threshold 
                THEN (inv.low_stock_threshold - inv.available_quantity) + 10
                ELSE 0
            END AS suggested_reorder_quantity
        FROM 
            product_variants pv
            INNER JOIN inventories inv ON pv.id = inv.product_variant_id
            INNER JOIN products p ON pv.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_images pi on pv.product_image_id = pi.id
        WHERE 
            pv.shop_id = ?
            AND inv.shop_id = ?
            -- Using < (strictly less than) to match your count
            AND inv.available_quantity < inv.low_stock_threshold
            -- Exclude soft-deleted
            AND pv.deleted_at IS NULL
            AND p.deleted_at IS NULL
            -- Only active products (variants don't have is_active, so we use product's is_active)
            AND p.is_active = TRUE
        ORDER BY 
            inv.available_quantity ASC,
            p.name ASC;
        `
        const [rows] = await pool.query<RowDataPacket[]>(sql,[shop_id,shop_id]);
        return rows;
    }

    static async getProductRanking(shop_id:number){
        const sql = `
            SELECT 
                p.id AS product_id,
                p.name AS product_name,
                pv.id AS variant_id,
                pv.variant_name,
                pv.sku AS variant_sku,
                pv.selling_price,
                pv.cost_price,
                
                pi.image_url,
                pi.created_at AS image_created_at,
                
                inv.id AS inventory_id,
                inv.location,
                inv.quantity_on_hand,
                inv.available_quantity,
                inv.low_stock_threshold,
                inv.damaged_quantity,
                c.name AS category_name,
                
                -- Sales statistics with date filter
                COALESCE(SUM(oi.quantity), 0) AS total_units_sold,
                COALESCE(COUNT(DISTINCT o.id), 0) AS total_orders,
                COALESCE(SUM(oi.total_price), 0) AS total_revenue,

                -- Ranking and performance metrics
                DENSE_RANK() OVER (ORDER BY COALESCE(SUM(oi.quantity), 0) DESC) AS sales_rank,
                
                -- Average daily sales (for reorder forecasting)
                CASE 
                    WHEN COALESCE(SUM(oi.quantity), 0) > 0 THEN 
                        ROUND(COALESCE(SUM(oi.quantity), 0) / NULLIF(DATEDIFF(CURRENT_DATE, MIN(o.created_at)), 0), 2)
                    ELSE 0
                END AS avg_daily_sales

            FROM 
                product_variants pv
                INNER JOIN inventories inv ON pv.id = inv.product_variant_id
                INNER JOIN products p ON pv.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_images pi ON pv.product_image_id = pi.id
                LEFT JOIN order_items oi ON pv.id = oi.product_variant_id
                LEFT JOIN orders o ON oi.order_id = o.id 
                    AND o.status IN ('PAID', 'CONFIRMED')
                    AND o.shop_id = ?
                    -- Filter by date range (last 30 days example)
                    AND o.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
                
            WHERE 
                pv.shop_id = ?
                AND inv.shop_id = ?
                AND pv.deleted_at IS NULL
                AND p.deleted_at IS NULL
                AND p.is_active = TRUE
                AND pv.is_active = TRUE
                
            GROUP BY 
                p.id, p.name, pv.id, pv.variant_name, pv.sku, 
                pv.selling_price, pv.cost_price, pi.image_url, 
                pi.created_at, inv.id, inv.location, 
                inv.quantity_on_hand, inv.available_quantity, 
                inv.low_stock_threshold, inv.damaged_quantity, c.name
                
            ORDER BY 
                total_units_sold DESC,
                total_revenue DESC;
        `
        const [rows] = await pool.query<RowDataPacket[]>(sql,[shop_id,shop_id,shop_id]);
        return rows;
    }
}