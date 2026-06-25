// ─── POS Types ───────────────────────────────────────────────────────────────

export interface POSProduct {
  product_id: number;
  name: string;
  category: string | null;
  variant_id: number;
  variant_name: string;
  sku: string;
  selling_price: number;
  available_quantity: number;
  image_url: string | null;
}

export interface CartItem {
  variant_id: number;
  product_id: number;
  product_name: string;
  variant_name: string;
  sku: string;
  selling_price: number;
  quantity: number;
  available_quantity: number;
  image_url: string | null;
}

export interface OrderPayload {
  shop_id: number;
  cashier_id: number;
  customer_name?: string;
  payment_method: 'CASH' | 'BANK_TRANSFER' | 'OTHER';
  discount: number;
  tax: number;
  notes?: string;
  items: {
    product_variant_id: number;
    quantity: number;
    unit_price: number;
  }[];
}

export interface OrderResponse {
  id: number;
  shop_id: number;
  cashier_id: number;
  customer_name: string | null;
  status: 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
  payment_method: 'CASH' | 'BANK_TRANSFER' | 'OTHER';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  items: {
    id: number;
    variant_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}