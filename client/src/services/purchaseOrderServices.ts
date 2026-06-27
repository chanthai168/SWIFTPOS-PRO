    // src/services/purchaseOrderServices.ts
    import api from './api';
    import type {
    CreatePurchaseOrderInput,
    UpdatePurchaseOrderInput,
    POStatus,
    } from '../types/purchaseOrder';

    export const purchaseOrderService = {
    getPurchaseOrders: async (shopId: number, status?: string, supplierId?: number) => {
        const params: Record<string, string> = {};
        if (status) params.status = status;
        if (supplierId) params.supplierId = String(supplierId);
        const response = await api.get(`/supply-chain/shops/${shopId}/purchase-orders`, { params });
        return response.data;
    },

    getPurchaseOrderById: async (shopId: number, poId: number) => {
        const response = await api.get(`/supply-chain/shops/${shopId}/purchase-orders/${poId}`);
        return response.data;
    },

    createPurchaseOrder: async (shopId: number, data: CreatePurchaseOrderInput) => {
        const response = await api.post(`/supply-chain/shops/${shopId}/purchase-orders`, data);
        return response.data;
    },

    updatePurchaseOrder: async (shopId: number, data: UpdatePurchaseOrderInput) => {
        const response = await api.put(`/supply-chain/shops/${shopId}/purchase-orders/${data.id}`, data);
        return response.data;
    },

    updateStatus: async (shopId: number, poId: number, status: POStatus) => {
        const response = await api.patch(`/supply-chain/shops/${shopId}/purchase-orders/${poId}/status`, { status });
        return response.data;
    },

    deletePurchaseOrder: async (shopId: number, poId: number) => {
        const response = await api.delete(`/supply-chain/shops/${shopId}/purchase-orders/${poId}`);
        return response.data;
    },
    downloadPdf: async (shopId: number, poId: number) => {
        const response = await api.get(
        `/supply-chain/shops/${shopId}/purchase-orders/${poId}/pdf`,
        { responseType: 'arraybuffer' }
        );
        return response.data;
    },
    emailToSupplier: async (shopId: number, poId: number, supplierEmail: string) => {
    const response = await api.post(
        `/supply-chain/shops/${shopId}/purchase-orders/${poId}/email`,
        { supplier_email: supplierEmail }
    );
    return response.data;
    },
    };