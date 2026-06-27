    import api from './api';
    import type { CreateSupplierInput, SupplierUpdateDTO } from '../types/supplier';

    export const supplierService = {
    getSuppliers: async (shopId: number, search?: string, activeOnly?: boolean) => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (activeOnly) params.activeOnly = 'true';
        const response = await api.get(`/supply-chain/shops/${shopId}/suppliers`, { params });
        return response.data;
    },
    getSupplierById: async (shopId: number, supplierId: number) => {
        const response = await api.get(`/supply-chain/shops/${shopId}/suppliers/${supplierId}`);
        return response.data;
    },
    createSupplier: async (shopId: number, data: CreateSupplierInput) => {
        const response = await api.post(`/supply-chain/shops/${shopId}/suppliers`, data);
        return response.data;
    },
    updateSupplier: async (shopId: number, data: SupplierUpdateDTO) => {
        const response = await api.put(`/supply-chain/shops/${shopId}/suppliers/${data.id}`, data);
        return response.data;
    },
    deactivateSupplier: async (shopId: number, supplierId: number) => {
        const response = await api.patch(`/supply-chain/shops/${shopId}/suppliers/${supplierId}/deactivate`);
        return response.data;
    },
    deleteSupplier: async (shopId: number, supplierId: number) => {
        const response = await api.delete(`/supply-chain/shops/${shopId}/suppliers/${supplierId}`);
        return response.data;
    },
    };