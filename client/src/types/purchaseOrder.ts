    // src/types/purchaseOrder.ts

    export type POStatus = 'DRAFT' | 'SENT' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

    export interface PurchaseOrderListItem {
    id: number;
    shop_id: number;
    supplier_id: number;
    supplier_name: string;
    created_by_user_id: number;
    status: POStatus;
    order_date: string;
    expected_delivery_date: string | null;
    total_cost: string | number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    item_count: number;
    }

    export interface PurchaseOrderItemDetail {
    id: number;
    product_variant_id: number;
    sku: string;
    variant_name: string;
    product_name: string;
    quantity: number;
    unit_cost: string | number;
    total_cost: string | number;
    }

    export interface PurchaseOrderDetail extends Omit<PurchaseOrderListItem, 'item_count'> {
    lead_time_days: number;
    items: PurchaseOrderItemDetail[];
    }

    export interface CreatePOItemInput {
    product_variant_id: number;
    quantity: number;
    unit_cost: number;
    }

    export interface CreatePurchaseOrderInput {
    supplier_id: number;
    order_date: string;
    expected_delivery_date?: string;
    notes?: string;
    items: CreatePOItemInput[];
    }

    export interface UpdatePurchaseOrderInput {
    id: number;
    supplier_id?: number;
    order_date?: string;
    expected_delivery_date?: string;
    notes?: string;
    items?: CreatePOItemInput[];
    }