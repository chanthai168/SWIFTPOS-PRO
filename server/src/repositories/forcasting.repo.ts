import type { RowDataPacket } from "mysql2";
import pool from "../config/poolConnection.js";

interface DailySalesRow extends RowDataPacket {
  day_number: number;
  day_name: string;
  total_orders: number;
  total_units_sold: number;
  total_revenue: number;
  avg_order_value: number;
  active_cashiers: number;
  unique_products_sold: number;
  avg_units_per_order: number;
  avg_daily_revenue: number;
  avg_daily_units: number;
  avg_daily_orders: number;
  revenue_percentage: number;
  order_percentage: number;
}

interface WeeklySalesRow extends RowDataPacket {
  iso_year_week: number;
  week_start_date: string;
  week_end_date: string;
  week_label: string;
  total_orders: number;
  total_units_sold: number;
  total_revenue: number;
  avg_order_value: number;
  active_cashiers: number;
  unique_products_sold: number;
  avg_daily_revenue: number;
  avg_daily_units: number;
  revenue_percentage_of_month: number;
  order_percentage_of_month: number;
}

interface MonthlySalesRow extends RowDataPacket {
  month_number: number;
  month_name: string;
  month_start_date: string;
  month_end_date: string;
  total_orders: number;
  total_units_sold: number;
  total_revenue: number;
  avg_order_value: number;
  active_cashiers: number;
  unique_products_sold: number;
  avg_daily_revenue: number;
  avg_daily_units: number;
  avg_daily_orders: number;
  revenue_growth_factor: number | null;
  revenue_percentage: number;
  order_percentage: number;
}

export interface SaleAnalyticResult {
  daily: DailySalesRow[];
  weekly: WeeklySalesRow[];
  monthly: MonthlySalesRow[];
}

// ---------- SQL ----------

const DAILY_SALES_QUERY = `
  SELECT 
      DAYOFWEEK(o.created_at) AS day_number,
      DAYNAME(o.created_at) AS day_name,
      COUNT(DISTINCT o.id) AS total_orders,
      SUM(oi.quantity) AS total_units_sold,
      SUM(oi.total_price) AS total_revenue,
      ROUND(SUM(oi.total_price) / NULLIF(COUNT(DISTINCT o.id), 0), 2) AS avg_order_value,
      COUNT(DISTINCT o.cashier_id) AS active_cashiers,
      COUNT(DISTINCT oi.product_variant_id) AS unique_products_sold,
      ROUND(SUM(oi.quantity) / NULLIF(COUNT(DISTINCT o.id), 0), 2) AS avg_units_per_order,
      ROUND(SUM(oi.total_price) / NULLIF(COUNT(DISTINCT DATE(o.created_at)), 0), 2) AS avg_daily_revenue,
      ROUND(SUM(oi.quantity) / NULLIF(COUNT(DISTINCT DATE(o.created_at)), 0), 2) AS avg_daily_units,
      ROUND(COUNT(DISTINCT o.id) / NULLIF(COUNT(DISTINCT DATE(o.created_at)), 0), 2) AS avg_daily_orders,
      ROUND(SUM(oi.total_price) / NULLIF(SUM(SUM(oi.total_price)) OVER (), 0) * 100, 2) AS revenue_percentage,
      ROUND(COUNT(DISTINCT o.id) / NULLIF(SUM(COUNT(DISTINCT o.id)) OVER (), 0) * 100, 2) AS order_percentage
  FROM 
      orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      INNER JOIN product_variants pv ON oi.product_variant_id = pv.id
      INNER JOIN products p ON pv.product_id = p.id
  WHERE 
      o.shop_id = ?
      AND o.status IN ('PAID', 'CONFIRMED')
      AND o.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
      AND p.deleted_at IS NULL
      AND p.is_active = TRUE
      AND pv.deleted_at IS NULL
  GROUP BY 
      DAYOFWEEK(o.created_at),
      DAYNAME(o.created_at)
  ORDER BY 
      day_number ASC;
`;

const WEEKLY_SALES_QUERY = `
  WITH weekly_data AS (
      SELECT 
          YEARWEEK(o.created_at, 3) AS iso_year_week,
          DATE_SUB(o.created_at, INTERVAL WEEKDAY(o.created_at) DAY) AS week_start_date,
          DATE_ADD(DATE_SUB(o.created_at, INTERVAL WEEKDAY(o.created_at) DAY), INTERVAL 6 DAY) AS week_end_date,
          o.id AS order_id,
          o.cashier_id,
          oi.product_variant_id,
          oi.quantity,
          oi.total_price
      FROM 
          orders o
          INNER JOIN order_items oi ON o.id = oi.order_id
          INNER JOIN product_variants pv ON oi.product_variant_id = pv.id
          INNER JOIN products p ON pv.product_id = p.id
      WHERE 
          o.shop_id = ?
          AND o.status IN ('PAID', 'CONFIRMED')
          AND o.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
          AND p.deleted_at IS NULL
          AND p.is_active = TRUE
          AND pv.deleted_at IS NULL
  )
  SELECT 
      iso_year_week,
      week_start_date,
      week_end_date,
      CONCAT(DATE_FORMAT(week_start_date, '%b %d'), ' - ', DATE_FORMAT(week_end_date, '%b %d, %Y')) AS week_label,
      COUNT(DISTINCT order_id) AS total_orders,
      SUM(quantity) AS total_units_sold,
      SUM(total_price) AS total_revenue,
      ROUND(SUM(total_price) / NULLIF(COUNT(DISTINCT order_id), 0), 2) AS avg_order_value,
      COUNT(DISTINCT cashier_id) AS active_cashiers,
      COUNT(DISTINCT product_variant_id) AS unique_products_sold,
      ROUND(SUM(total_price) / NULLIF(DATEDIFF(week_end_date, week_start_date) + 1, 0), 2) AS avg_daily_revenue,
      ROUND(SUM(quantity) / NULLIF(DATEDIFF(week_end_date, week_start_date) + 1, 0), 2) AS avg_daily_units,
      ROUND(SUM(total_price) / NULLIF(SUM(SUM(total_price)) OVER (PARTITION BY DATE_FORMAT(week_start_date, '%Y-%m')), 0) * 100, 2) AS revenue_percentage_of_month,
      ROUND(COUNT(DISTINCT order_id) / NULLIF(SUM(COUNT(DISTINCT order_id)) OVER (PARTITION BY DATE_FORMAT(week_start_date, '%Y-%m')), 0) * 100, 2) AS order_percentage_of_month
  FROM 
      weekly_data
  GROUP BY 
      iso_year_week,
      week_start_date,
      week_end_date
  ORDER BY 
      week_start_date DESC;
`;

const MONTHLY_SALES_QUERY = `
  WITH monthly AS (
      SELECT
          YEAR(o.created_at) AS yr,
          MONTH(o.created_at) AS month_number,
          MONTHNAME(o.created_at) AS month_name,
          DATE_FORMAT(o.created_at, '%Y-%m-01') AS month_start_date,
          LAST_DAY(o.created_at) AS month_end_date,
          COUNT(DISTINCT o.id) AS total_orders,
          SUM(oi.quantity) AS total_units_sold,
          SUM(oi.total_price) AS total_revenue,
          COUNT(DISTINCT o.cashier_id) AS active_cashiers,
          COUNT(DISTINCT oi.product_variant_id) AS unique_products_sold
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      INNER JOIN product_variants pv ON oi.product_variant_id = pv.id
      INNER JOIN products p ON pv.product_id = p.id
      WHERE o.shop_id = ?
        AND o.status IN ('PAID', 'CONFIRMED')
        AND o.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
        AND p.deleted_at IS NULL
        AND p.is_active = TRUE
        AND pv.deleted_at IS NULL
      GROUP BY yr, month_number, month_name, month_start_date, month_end_date
  )
  SELECT
      month_number, month_name, month_start_date, month_end_date,
      total_orders, total_units_sold, total_revenue,
      ROUND(total_revenue / NULLIF(total_orders, 0), 2) AS avg_order_value,
      active_cashiers, unique_products_sold,
      ROUND(total_revenue / DAY(month_end_date), 2) AS avg_daily_revenue,
      ROUND(total_units_sold / DAY(month_end_date), 2) AS avg_daily_units,
      ROUND(total_orders / DAY(month_end_date), 2) AS avg_daily_orders,
      ROUND(total_revenue / NULLIF(LAG(total_revenue) OVER (ORDER BY yr, month_number), 0), 2) AS revenue_growth_factor,
      ROUND(total_revenue / NULLIF(SUM(total_revenue) OVER (), 0) * 100, 2) AS revenue_percentage,
      ROUND(total_orders / NULLIF(SUM(total_orders) OVER (), 0) * 100, 2) AS order_percentage
  FROM monthly
  ORDER BY yr DESC, month_number DESC;
`;


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

    static async getSaleAnalytic(shop_id:number){
        const [dailyResult, weeklyResult, monthlyResult] = await Promise.all([
        pool.query<DailySalesRow[]>(DAILY_SALES_QUERY, [shop_id]),
        pool.query<WeeklySalesRow[]>(WEEKLY_SALES_QUERY, [shop_id]),
        pool.query<MonthlySalesRow[]>(MONTHLY_SALES_QUERY, [shop_id]),
        ]);

        return {
        daily: dailyResult[0],
        weekly: weeklyResult[0],
        monthly: monthlyResult[0],
        };
    }
}