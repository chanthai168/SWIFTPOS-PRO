import { useState, useCallback } from 'react';
import type { CartItem, POSProduct } from '../types/pos';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: POSProduct) => {
    setItems(prev => {
      const existing = prev.find(i => i.variant_id === product.variant_id);
      if (existing) {
        if (existing.quantity >= existing.available_quantity) return prev;
        return prev.map(i =>
          i.variant_id === product.variant_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      if (product.available_quantity <= 0) return prev;
      return [
        ...prev,
        {
          variant_id: product.variant_id,
          product_id: product.product_id,
          product_name: product.name,
          variant_name: product.variant_name,
          sku: product.sku,
          selling_price: product.selling_price,
          quantity: 1,
          available_quantity: product.available_quantity,
          image_url: product.image_url,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((variantId: number) => {
    setItems(prev => prev.filter(i => i.variant_id !== variantId));
  }, []);

  const updateQty = useCallback((variantId: number, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.variant_id !== variantId));
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.variant_id === variantId
          ? { ...i, quantity: Math.min(qty, i.available_quantity) }
          : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((sum, i) => sum + i.selling_price * i.quantity, 0);

  return { items, addItem, removeItem, updateQty, clearCart, subtotal };
}