import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { AxiosError } from 'axios';
import { purchaseOrderService } from '../../services/purchaseOrderServices';
import { useUser } from '../../context/Context';
import { useNotification, NotificationContainer } from '../../public/Notify';
import type {
  PurchaseOrderListItem,
  PurchaseOrderDetail,
  POStatus,
  CreatePOItemInput,
} from '../../types/purchaseOrder';
import PurchaseOrderFormModal from './PurchaseOrderFormModal';
import PurchaseOrderDetailModal from './PurchaseOrderDetailModal';

const STATUS_STYLES: Record<POStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SENT: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-amber-100 text-amber-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const STATUS_FILTERS: ('ALL' | POStatus)[] = ['ALL', 'DRAFT', 'SENT', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];

const PurchaseOrderList: React.FC = () => {
  const { shop } = useUser();
  const { notify, notifications } = useNotification();

  const [orders, setOrders] = useState<PurchaseOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | POStatus>('ALL');

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrderDetail | null>(null);

  const [viewingPO, setViewingPO] = useState<PurchaseOrderDetail | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!shop?.id) return;
    setLoading(true);
    try {
      const res = await purchaseOrderService.getPurchaseOrders(
        shop.id,
        statusFilter === 'ALL' ? undefined : statusFilter
      );
      setOrders(res.data ?? []);
    } catch (error) {
      if (error instanceof AxiosError) notify('error', error.message);
      else notify('error', 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  }, [shop?.id, statusFilter]);

  useEffect(() => {
    const loadOrders = async () => {
      await fetchOrders();
    };

    void loadOrders();
  }, [fetchOrders]);

  const openCreateModal = () => {
    setEditingPO(null);
    setShowFormModal(true);
  };

  const openEditModal = async (poId: number) => {
    if (!shop?.id) return;
    try {
      const res = await purchaseOrderService.getPurchaseOrderById(shop.id, poId);
      setEditingPO(res.data);
      setShowFormModal(true);
    } catch (error) {
      if (error instanceof AxiosError) notify('error', error.message);
      else notify('error', 'Failed to load purchase order');
    }
  };

  const openDetail = async (poId: number) => {
    if (!shop?.id) return;
    try {
      const res = await purchaseOrderService.getPurchaseOrderById(shop.id, poId);
      setViewingPO(res.data);
    } catch (error) {
      if (error instanceof AxiosError) notify('error', error.message);
      else notify('error', 'Failed to load purchase order');
    }
  };

  const handleCreate = async (data: {
    supplier_id: number;
    order_date: string;
    expected_delivery_date?: string;
    notes?: string;
    items: CreatePOItemInput[];
  }) => {
    if (!shop?.id) return;
    try {
      await purchaseOrderService.createPurchaseOrder(shop.id, data);
      notify('success', 'Purchase order created');
      setShowFormModal(false);
      fetchOrders();
    } catch (error) {
      if (error instanceof AxiosError) notify('error', error.message);
      else notify('error', 'Failed to create purchase order');
    }
  };

  const handleUpdate = async (data: {
    supplier_id: number;
    order_date: string;
    expected_delivery_date?: string;
    notes?: string;
    items: CreatePOItemInput[];
  }) => {
    if (!shop?.id || !editingPO) return;
    try {
      await purchaseOrderService.updatePurchaseOrder(shop.id, { id: editingPO.id, ...data });
      notify('success', 'Purchase order updated');
      setShowFormModal(false);
      setEditingPO(null);
      fetchOrders();
    } catch (error) {
      if (error instanceof AxiosError) notify('error', error.message);
      else notify('error', 'Failed to update purchase order');
    }
  };

  const handleDelete = async (po: PurchaseOrderListItem) => {
    if (!shop?.id) return;
    if (po.status !== 'DRAFT') {
      notify('error', 'Only DRAFT purchase orders can be deleted');
      return;
    }
    if (!confirm(`Delete purchase order #${po.id}? This cannot be undone.`)) return;
    try {
      await purchaseOrderService.deletePurchaseOrder(shop.id, po.id);
      notify('success', 'Purchase order deleted');
      fetchOrders();
    } catch (error) {
      if (error instanceof AxiosError) notify('error', error.message);
      else notify('error', 'Failed to delete purchase order');
    }
  };

  const handleTransition = async (status: POStatus) => {
    if (!shop?.id || !viewingPO) return;
    try {
      await purchaseOrderService.updateStatus(shop.id, viewingPO.id, status);
      notify('success', `Purchase order moved to ${status}`);
      const res = await purchaseOrderService.getPurchaseOrderById(shop.id, viewingPO.id);
      setViewingPO(res.data);
      fetchOrders();
    } catch (error) {
      if (error instanceof AxiosError) notify('error', error.message);
      else notify('error', 'Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <NotificationContainer notifications={notifications} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                statusFilter === s
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          <Plus size={16} />
          New Purchase Order
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">PO #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Order Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Items</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  Loading purchase orders...
                </td>
              </tr>
            )}

            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  No purchase orders yet. Click "New Purchase Order" to create one.
                </td>
              </tr>
            )}

            {!loading &&
              orders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openDetail(po.id)}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">#{po.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{po.supplier_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(po.order_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{po.item_count}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    ${Number(po.total_cost).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[po.status]}`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openDetail(po.id)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-teal-600"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      {po.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => openEditModal(po.id)}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-teal-600"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(po)}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showFormModal && (
        <PurchaseOrderFormModal
          initial={editingPO}
          onClose={() => {
            setShowFormModal(false);
            setEditingPO(null);
          }}
          onSubmit={editingPO ? handleUpdate : handleCreate}
        />
      )}

      {viewingPO && (
        <PurchaseOrderDetailModal
          po={viewingPO}
          onClose={() => setViewingPO(null)}
          onTransition={handleTransition}
        />
      )}
    </div>
  );
};

export default PurchaseOrderList;
