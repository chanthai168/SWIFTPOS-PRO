    export interface Supplier {
    id: number;
    shop_id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    lead_time_days: number;
    is_active: boolean | number;
    created_at: string;
    updated_at: string;
    }

    export interface CreateSupplierInput {
    name: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    lead_time_days?: number;
    is_active?: boolean;
    }

    export interface SupplierUpdateDTO {
    id: number;
    name?: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    lead_time_days?: number;
    is_active?: boolean;
    }