// src/types/product.ts
export interface Product {
  id: number;
  shop_id: number;
  category_id: number | null;
  sku: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string;
}

export interface Category {
  id: number;
  shop_id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ProductVariant {
  sku: string;
  variant_name: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  location?: string;
  low_stock_threshold?: number;
  image?: File | null;
  imagePreview?: string;
}

export interface ProductFormData {
  id?:number,
  name: string;
  description: string;
  category_id: number | null;
  category_name?: string | null;
  is_active: boolean;
  variants: ProductVariant[];
}



export interface ProductDetailResponseDTO {
  id: number;
  shop_id: number;
  category: {
    id: number;
    name: string;
  };
  sku: string;
  name: string;
  description: string;
  is_active: boolean;
  variants: ProductVariantResponseDTO[];
  created_at: string; // JSON transformed Date -> string
  updated_at: string;
}

export interface ProductVariantResponseDTO {
  id: number;
  sku: string;
  variant_name: string;
  cost_price: number;
  selling_price: number;
  image: ProductVariantImageResponseDTO | null;
  inventory: InventoryResponseDTO | null;
}

export interface ProductVariantImageResponseDTO {
  id: number;
  image_url: string;
  file_name: string;
}

export interface InventoryResponseDTO {
  id: number;
  location: string;
  quantity_on_hand: number;
  available_quantity: number;
  damaged_quantity: number;
  low_stock_threshold: number;
}

//----------------------------- Product Update DTO ----------------

export interface ProductUpdateDTO{
    id: number,
    sku?: string,
    name?: string,
    description?: string,
    is_active?: boolean,
}

//----------------------------- Inventory Stock Adjustment DTO ----------------

// POST /api/inventory/adjust
export interface AdjustStockRequestDTO {
  inventory_id: number;
  shop_id: number;
  user_id: number; // The staff member making the change
  type: 'IN' | 'OUT' | 'ADJUST' | 'DAMAGE' | 'RESTOCK';
  change_amount: number; // e.g., -5 for damaged, +20 for restock
  description: string;
}

// GET /api/inventory/logs
export interface InventoryLogResponseDTO {
  id: number;
  inventory_id: number;
  user_id: number;
  type: 'IN' | 'OUT' | 'ADJUST' | 'DAMAGE' | 'RESTOCK';
  description: string;
  change_amount: number;
  created_at: string; // Timestamp of the action
}


export interface InventoryMetadata{
  success:boolean,
  rows:number,
  data:{
    total_selling_price:number,
    total_cost_price:number,
    total_product:number,
    in_stock:number,
    low_stock:number,
    out_of_stock:number,
  }
}
