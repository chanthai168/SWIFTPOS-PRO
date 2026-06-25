import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import type { CartItem } from '../../types/pos';

interface Props {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  onQtyChange: (variantId: number, qty: number) => void;
  onRemove: (variantId: number) => void;
  onDiscountChange: (val: number) => void;
  onTaxChange: (val: number) => void;
  onCheckout: () => void;
  loading: boolean;
}

const CartPanel: React.FC<Props> = ({
  items, subtotal, discount, tax,
  onQtyChange, onRemove, onDiscountChange, onTaxChange,
  onCheckout, loading,
}) => {
  const discountAmt = (subtotal * discount) / 100;
  const taxAmt = ((subtotal - discountAmt) * tax) / 100;
  const total = subtotal - discountAmt + taxAmt;

  return (
    <div className="flex flex-col h-full bg-layer2 rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <ShoppingBag size={18} className="text-primary" />
        <h2 className="font-bold text-gray-900 text-base">Cart</h2>
        <span className="ml-auto text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-10 text-center">
            <ShoppingBag size={40} className="text-gray-200" />
            <p className="text-sm text-gray-400">Cart is empty.<br />Tap a product to add it.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.variant_id} className="flex items-center gap-2 bg-layer3 rounded-xl p-2">
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                {item.image_url
                  ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">{item.product_name[0]}</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{item.product_name}</p>
                <p className="text-[10px] text-gray-400 truncate">{item.variant_name}</p>
                <p className="text-xs font-bold text-primary">${(item.selling_price * item.quantity).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onQtyChange(item.variant_id, item.quantity - 1)}
                  className="w-6 h-6 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <Minus size={10} />
                </button>
                <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                <button
                  onClick={() => onQtyChange(item.variant_id, item.quantity + 1)}
                  disabled={item.quantity >= item.available_quantity}
                  className="w-6 h-6 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors disabled:opacity-40"
                >
                  <Plus size={10} />
                </button>
              </div>
              <button
                onClick={() => onRemove(item.variant_id)}
                className="w-6 h-6 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 w-20 flex-shrink-0">Discount %</label>
          <input
            type="number" min={0} max={100} value={discount}
            onChange={e => onDiscountChange(Math.min(100, Math.max(0, Number(e.target.value))))}
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 w-20 flex-shrink-0">Tax %</label>
          <input
            type="number" min={0} max={100} value={tax}
            onChange={e => onTaxChange(Math.min(100, Math.max(0, Number(e.target.value))))}
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary bg-white"
          />
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-xs text-green-600">
            <span>Discount ({discount}%)</span><span>-${discountAmt.toFixed(2)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>Tax ({tax}%)</span><span>+${taxAmt.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-dashed border-gray-200">
          <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={onCheckout}
          disabled={items.length === 0 || loading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
        >
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Processing…' : `Charge $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default CartPanel;