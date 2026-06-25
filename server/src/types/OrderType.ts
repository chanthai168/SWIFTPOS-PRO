export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'OTHER';
export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';

export interface OrderItemInput {
  product_variant_id: number;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderDTO {
  customer_name?: string;
  payment_method: PaymentMethod;
  discount: number;
  tax: number;
  notes?: string;
  items: OrderItemInput[];
}

export interface OrderRow {
  id: number;
  shop_id: number;
  cashier_id: number;
  customer_name: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  item_count?: number;
  product_count?: number;
  items?: OrderItemRow[];
}

export interface OrderItemRow {
  id: number;
  order_id: number;
  product_variant_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_name?: string;
  sku?: string;
}
