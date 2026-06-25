import React, { useEffect, useState } from 'react';
import { X, ReceiptText, Clock } from 'lucide-react';
import { posService } from '../../services/posServices';

interface Props {
  shopId: number;
  onClose: () => void;
}

interface Order {
  id: number;
  customer_name: string | null;
  payment_method: string;
  total: number;
  status: string;
  created_at: string;
  product_count?: number;
  item_count?: number;
}

const TransactionLog: React.FC<Props> = ({ shopId, onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    posService.getOrders(shopId)
      .then(res => { setOrders(res?.data ?? res ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [shopId]);

  const statusColor: Record<string, string> = {
    PAID:      'bg-green-100 text-green-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-red-100 text-red-600',
    DRAFT:     'bg-gray-100 text-gray-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white w-full max-w-sm h-full flex flex-col shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
          <ReceiptText size={18} className="text-primary" />
          <h2 className="font-bold text-gray-900">Transaction Audit Log</h2>
          <button onClick={onClose} className="ml-auto w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Clock size={36} className="text-gray-200" />
              <p className="text-sm text-gray-400">No transactions yet.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-layer3 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">Order #{order.id}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {order.customer_name ?? 'Walk-in'}
                    {order.product_count != null && ` · ${order.product_count} item${order.product_count !== 1 ? 's' : ''}`}
                  </span>
                  <span className="text-xs font-bold text-primary">${Number(order.total).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>{order.payment_method.replace('_', ' ')}</span>
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionLog;