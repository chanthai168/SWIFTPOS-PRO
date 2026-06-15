// src/types/product.ts
// export interface Product {
//   id: number;
//   shop_id: number;
//   category_id: number | null;
//   name: string;
//   description: string | null;
//   is_active: boolean;
//   deleted_at: string | null;
//   created_at: string;
//   updated_at: string;
// }




// export interface ProductVariant {
//   sku: string;
//   variant_name: string;
//   cost_price: number;
//   selling_price: number;
//   stock_quantity: number;
//   location?: string;
//   low_stock_threshold?: number;
//   file?: File | null;
// }

export interface Category {
    id: number,
    shop_id: number,
    name: string,
    description: string,
}

export interface Product{
    id: number,
    shop_id: number,
    category_id: number,
    sku: string,
    name: string,
    description: string,
    is_active: boolean,
    deleted_at: Date,
    created_at: Date,
    updated_at: Date,
}



export interface ProductVariantImage{
    id: number,
    image_url: string,
    file_name: string,
    file_size: number,
    mimetype: string,
    created_at: Date,
}

export interface ProductVariant {
    id: number,
    shop_id: number,
    product_id: number,
    product_image_id: number,
    sku: string,
    variant_name: string,
    cost_price: number,
    selling_price: number,
    created_at: Date,
    updated_at: Date,
}

export interface Inventory {
    id: number,
    shop_id: number,
    product_variant_id: number,
    location: string,
    quantity_on_hand: number,
    available_quantity: number,
    damaged_quantity: number,
    low_stock_threshold: number,
    last_audited: Date,
    created_at: Date,
    updated_at: Date,
}

export interface InventoryLog{
      id: number,
    inventory_id: number,
    shop_id: number,
    user_id: number,
    type: 'IN' | 'OUT' | 'ADJUST' | 'DAMAGE' | 'RESTOCK' ,
    description: string,
    change_amount: number,
    created_at: Date,
}

//----------------------------- UPdate Product DTO ----------------
export interface ProductUpdateDTO{
    id: number,
    sku?: string,
    name?: string,
    description?: string,
    is_active?: boolean,
}

export interface VariantUpdateDTO{
    id: number,
    variant_name: string,
    sku: string,
    cost_price: string,
    selling_price: string,
    inventory_id: number,
    location: string,
    quantity_on_hand:string,
    available_quantity: string,
    damaged_quantity: number,
    low_stock_threshold: string,
}

//----------------------------- Product Request DTO ----------------
export interface CreateProductDTO {
  shop_id: number;
  category_id: number | null;
  sku: string;
  name: string;
  description: string;
  variants: CreateProductVariantDTO[];
}

export interface CreateProductVariantDTO {
  sku: string;
  variant_name: string;
  cost_price: number;
  selling_price: number;
  image?: CreateProductVariantImageDTO; 
  inventory: CreateInventoryDTO;       
}

export interface CreateProductVariantImageDTO {
  image_url: string;
  file_name: string;
  file_size: number;
  mimetype: string;
}

export interface CreateInventoryDTO {
  location: string;
  quantity_on_hand: number;
  low_stock_threshold: number;
}



//----------------------------- Product Response DTO ----------------

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
