import React, { useState, useEffect, useMemo } from 'react';
import { ReceiptText, RefreshCw, Keyboard } from 'lucide-react';
import { useUser } from '../context/Context';
import { useCart } from '../hooks/useCart';
import { posService } from '../services/posServices';
import type { POSProduct, OrderResponse } from '../types/pos';

import ProductCard from '../components/pos/productCard';
import CartPanel from '../components/pos/CartPanel';
import CheckoutModal from '../components/pos/CheckoutModal';
import SearchBar from '../components/pos/SearchBar';
import TransactionLog from '../components/pos/TransactionLog';

type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'OTHER';

const POS: React.FC = () => {
  const { shop } = useUser();

  const [products, setProducts]       = useState<POSProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch]           = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const { items, addItem, removeItem, updateQty, clearCart, subtotal } = useCart();
  const [discount, setDiscount] = useState(0);
  const [tax, setTax]           = useState(0);

  const [showCheckout, setShowCheckout] = useState(false);
  const [showLogs, setShowLogs]         = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const discountAmt = (subtotal * discount) / 100;
  const taxAmt      = ((subtotal - discountAmt) * tax) / 100;
  const total       = subtotal - discountAmt + taxAmt;

  const loadProducts = async () => {
    if (!shop?.id) return;
    setLoadingProducts(true);
    try {
      const data = await posService.getCatalog(shop.id);
      setProducts(data);
    } catch (e) {
      console.error('Failed to load catalog', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => { loadProducts(); }, [shop?.id]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category ?? 'Uncategorized')));
    return ['All', ...cats];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'All' || (p.category ?? 'Uncategorized') === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q
        || p.name.toLowerCase().includes(q)
        || p.variant_name.toLowerCase().includes(q)
        || p.sku.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, search, activeCategory]);

  const handleCheckout = async (
    method: PaymentMethod,
    customerName: string,
    notes: string,
  ): Promise<OrderResponse | null> => {
    if (!shop?.id) return null;
    setCheckoutLoading(true);
    try {
      const payload = {
        shop_id: shop.id,
        cashier_id: 0,
        customer_name: customerName || undefined,
        payment_method: method,
        discount: discountAmt,
        tax: taxAmt,
        notes: notes || undefined,
        items: items.map(i => ({
          product_variant_id: i.variant_id,
          quantity: i.quantity,
          unit_price: i.selling_price,
        })),
      };
      const res = await posService.createOrder(payload);
      const order: OrderResponse = res?.data ?? res;
      clearCart();
      setDiscount(0);
      setTax(0);
      setShowCheckout(false);
      await loadProducts();
      return order;
    } catch (e: unknown) {
      console.error('Checkout failed', e);
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Checkout failed. Please try again.');
      return null;
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-layer2 border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Point of Sale</h1>
          <p className="text-xs text-gray-500 mt-0.5">Quick sell · {shop?.name}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-2.5 py-1.5 rounded-lg">
            <Keyboard size={12} /> Press <kbd className="bg-white border border-gray-200 px-1 rounded text-[10px]">/</kbd> to search
          </span>
          <button onClick={() => setShowLogs(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-layer3 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors">
            <ReceiptText size={14} /> Audit Log
          </button>
          <button onClick={loadProducts} disabled={loadingProducts}
            className="w-8 h-8 rounded-xl bg-layer3 hover:bg-gray-200 flex items-center justify-center text-gray-500">
            <RefreshCw size={14} className={loadingProducts ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Product Grid */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
          <div className="flex gap-2 items-center">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 flex-nowrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all
                  ${activeCategory === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-layer2 text-gray-600 hover:bg-gray-200 border border-gray-100'
                  }`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-44 bg-layer2 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <p className="text-4xl">🔍</p>
                <p className="text-sm text-gray-400">No products found.</p>
                {search && <button onClick={() => setSearch('')} className="text-xs text-primary underline">Clear search</button>}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filtered.map(product => {
                  const cartItem = items.find(i => i.variant_id === product.variant_id);
                  return (
                    <ProductCard
                      key={product.variant_id}
                      product={product}
                      inCartQty={cartItem?.quantity ?? 0}
                      onAdd={addItem}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="w-72 xl:w-80 flex-shrink-0 p-4 pl-0 flex flex-col">
          <CartPanel
            items={items}
            subtotal={subtotal}
            discount={discount}
            tax={tax}
            onQtyChange={updateQty}
            onRemove={removeItem}
            onDiscountChange={setDiscount}
            onTaxChange={setTax}
            onCheckout={() => setShowCheckout(true)}
            loading={checkoutLoading}
          />
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          items={items}
          subtotal={subtotal}
          discount={discount}
          tax={tax}
          total={total}
          onConfirm={handleCheckout}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {showLogs && shop?.id && (
        <TransactionLog shopId={shop.id} onClose={() => setShowLogs(false)} />
      )}
    </div>
  );
};

export default POS;