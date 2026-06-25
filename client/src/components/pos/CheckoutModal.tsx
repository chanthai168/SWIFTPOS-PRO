import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone, Check, Printer } from 'lucide-react';
import type { CartItem, OrderResponse } from '../../types/pos';

type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'OTHER';

interface Props {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  onConfirm: (method: PaymentMethod, customerName: string, notes: string) => Promise<OrderResponse | null>;
  onClose: () => void;
}

const METHODS: { key: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { key: 'CASH',          label: 'Cash',          icon: <Banknote size={20} /> },
  { key: 'BANK_TRANSFER', label: 'Bank Transfer',  icon: <CreditCard size={20} /> },
  { key: 'OTHER',         label: 'Other',          icon: <Smartphone size={20} /> },
];

const CheckoutModal: React.FC<Props> = ({
  items, subtotal, discount, tax, total, onConfirm, onClose,
}) => {
  const [method, setMethod]           = useState<PaymentMethod>('CASH');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [receipt, setReceipt]         = useState<OrderResponse | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    const result = await onConfirm(method, customerName, notes);
    setLoading(false);
    if (result) setReceipt(result);
  };

  if (receipt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <Check size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Payment Successful</h2>
          <div className="w-full bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Order #</span><span className="font-bold">{receipt.id}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium">{receipt.payment_method.replace('_', ' ')}</span></div>
            {receipt.customer_name && <div className="flex justify-between"><span className="text-gray-500">Customer</span><span>{receipt.customer_name}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${Number(receipt.subtotal).toFixed(2)}</span></div>
            {Number(receipt.discount) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${Number(receipt.discount).toFixed(2)}</span></div>}
            {Number(receipt.tax) > 0 && <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>+${Number(receipt.tax).toFixed(2)}</span></div>}
            <div className="flex justify-between text-base font-bold border-t border-dashed pt-2 mt-2">
              <span>Total Paid</span><span className="text-primary">${Number(receipt.total).toFixed(2)}</span>
            </div>
          </div>
          <div className="flex gap-2 w-full">
            <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Printer size={16} /> Print
            </button>
            <button onClick={onClose} className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-bold hover:bg-primary/90">
              New Sale
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Confirm Payment</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500"><span>Items ({items.length})</span><span>${subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${((subtotal * discount) / 100).toFixed(2)}</span></div>}
            {tax > 0 && <div className="flex justify-between text-gray-500"><span>Tax</span><span>+${(((subtotal - (subtotal * discount) / 100) * tax) / 100).toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-dashed border-gray-200">
              <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(m => (
                <button key={m.key} onClick={() => setMethod(m.key)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-all
                    ${method === m.key ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {m.icon}{m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Customer Name <span className="normal-case font-normal text-gray-400">(optional)</span>
            </label>
            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
              placeholder="Walk-in customer"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Notes <span className="normal-case font-normal text-gray-400">(optional)</span>
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Any note for this order…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
          </div>
        </div>

        <div className="px-5 pb-5">
          <button onClick={handleConfirm} disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 shadow-md">
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Processing…' : `Confirm & Pay $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;