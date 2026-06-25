import React from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import type { POSProduct } from '../../types/pos';

interface Props {
  product: POSProduct;
  inCartQty: number;
  onAdd: (product: POSProduct) => void;
}

const ProductCard: React.FC<Props> = ({ product, inCartQty, onAdd }) => {
  const outOfStock = product.available_quantity <= 0;
  const maxReached = inCartQty >= product.available_quantity;
  const disabled = outOfStock || maxReached;

  return (
    <button
      onClick={() => !disabled && onAdd(product)}
      disabled={disabled}
      className={`relative group flex flex-col bg-layer2 rounded-2xl border transition-all duration-200 text-left overflow-hidden
        ${disabled
          ? 'opacity-50 cursor-not-allowed border-gray-100'
          : 'border-gray-100 hover:border-primary hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:scale-[0.98]'
        }`}
    >
      <div className="w-full h-28 bg-layer3 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-10 h-10 text-gray-300" />
        )}
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs text-gray-400 truncate">{product.category ?? 'Uncategorized'}</p>
        <p className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2">{product.name}</p>
        {product.variant_name !== product.name && (
          <p className="text-xs text-gray-500 truncate">{product.variant_name}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-bold text-primary text-sm">
            ${Number(product.selling_price).toFixed(2)}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full
            ${outOfStock ? 'bg-red-100 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {outOfStock ? 'Out of stock' : `${product.available_quantity} left`}
          </span>
        </div>
      </div>

      {inCartQty > 0 && (
        <span className="absolute top-2 right-2 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
          {inCartQty}
        </span>
      )}

      {!disabled && (
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 pointer-events-none">
          <span className="flex items-center gap-1 text-primary text-xs font-semibold bg-white/90 px-3 py-1 rounded-full shadow">
            <ShoppingCart size={12} /> Add to cart
          </span>
        </div>
      )}
    </button>
  );
};

export default ProductCard;