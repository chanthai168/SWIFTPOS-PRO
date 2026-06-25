import api from './api';
import type { OrderPayload, POSProduct } from '../types/pos';

export const posService = {
  getCatalog: async (shopId: number, search?: string, limit = 100): Promise<POSProduct[]> => {
    const params: Record<string, string | number> = { limit };
    if (search) params.search = search;
    const response = await api.get(`/inventory/shops/${shopId}/products/with-variants`, { params });
    const raw = Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
    const flat: POSProduct[] = [];
    for (const product of raw) {
      for (const variant of product.variants ?? []) {
        flat.push({
          product_id: product.id,
          name: product.name,
          category: product.category?.name ?? null,
          variant_id: variant.id,
          variant_name: variant.variant_name,
          sku: variant.sku,
          selling_price: Number(variant.selling_price),
          available_quantity: variant.inventory?.available_quantity ?? 0,
          image_url: variant.image?.image_url ?? null,
        });
      }
    }
    return flat;
  },

  createOrder: async (payload: OrderPayload) => {
    const response = await api.post(`/pos/shops/${payload.shop_id}/orders`, payload);
    return response.data;
  },

  getOrders: async (shopId: number, limit = 20, offset = 0) => {
    const response = await api.get(`/pos/shops/${shopId}/orders`, {
      params: { limit, offset },
    });
    return response.data;
  },
};