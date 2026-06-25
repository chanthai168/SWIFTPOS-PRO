export interface TransactionHistoryItem {
  id: number;
  customer_name: string | null;
  payment_method: string;
  status: string;
  total: number;
  created_at: string;
  item_count: number;
  product_count: number;
}

export interface InventoryHistoryItem {
  id: number;
  type: string;
  description: string;
  change_amount: number;
  created_at: string;
  product_name: string;
  variant_name: string;
  sku: string;
  available_quantity: number;
}

export interface SupplyHistoryItem {
  id: number;
  status: string;
  order_date: string;
  expected_delivery_date: string | null;
  total_cost: number;
  notes: string | null;
  created_at: string;
  supplier_name: string;
  item_count: number;
  product_count: number;
}

export type HistoryTab = 'transactions' | 'inventory' | 'supply';
export type SortOrder = 'DESC' | 'ASC';
