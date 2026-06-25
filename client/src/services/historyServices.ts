import api from './api';
import type {
  InventoryHistoryItem,
  SortOrder,
  SupplyHistoryItem,
  TransactionHistoryItem,
} from '../types/history';

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
}

export const historyService = {
  getTransactions: async (
    shopId: number,
    limit = 10,
    offset = 0,
    sort: SortOrder = 'DESC',
  ): Promise<{ data: TransactionHistoryItem[]; total: number }> => {
    const response = await api.get<PaginatedResponse<TransactionHistoryItem>>(
      `/pos/shops/${shopId}/orders`,
      { params: { limit, offset, sort } },
    );
    return { data: response.data.data ?? [], total: response.data.total ?? 0 };
  },

  getInventoryLogs: async (
    shopId: number,
    limit = 10,
    offset = 0,
    sort: SortOrder = 'DESC',
  ): Promise<{ data: InventoryHistoryItem[]; total: number }> => {
    const response = await api.get<PaginatedResponse<InventoryHistoryItem>>(
      `/pos/shops/${shopId}/history/inventory`,
      { params: { limit, offset, sort } },
    );
    return { data: response.data.data ?? [], total: response.data.total ?? 0 };
  },

  getSupplyOrders: async (
    shopId: number,
    limit = 10,
    offset = 0,
    sort: SortOrder = 'DESC',
  ): Promise<{ data: SupplyHistoryItem[]; total: number }> => {
    const response = await api.get<PaginatedResponse<SupplyHistoryItem>>(
      `/pos/shops/${shopId}/history/supply`,
      { params: { limit, offset, sort } },
    );
    return { data: response.data.data ?? [], total: response.data.total ?? 0 };
  },
};
