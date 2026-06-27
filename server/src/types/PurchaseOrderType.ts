    // src/types/PurchaseOrderType.ts

    export type POStatus = 'DRAFT' | 'SENT' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

    export interface CreatePOItemDTO {
    product_variant_id: number;
    quantity: number;
    unit_cost: number;
    }

    export interface CreatePurchaseOrderDTO {
    supplier_id: number;
    order_date: string; // YYYY-MM-DD
    expected_delivery_date?: string;
    notes?: string;
    items: CreatePOItemDTO[];
    }

    export interface UpdatePurchaseOrderDTO {
    id: number;
    supplier_id?: number;
    order_date?: string;
    expected_delivery_date?: string;
    notes?: string;
    items?: CreatePOItemDTO[]; // if provided, replaces all line items (only allowed while DRAFT)
    }

    export interface UpdatePOStatusDTO {
    id: number;
    status: POStatus;
    }