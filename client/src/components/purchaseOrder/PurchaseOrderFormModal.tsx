import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Supplier } from '../../types/supplier';
import type { CreatePOItemInput, PurchaseOrderDetail } from '../../types/purchaseOrder';
import { supplierService } from '../../services/supplierServices';
import { productService } from '../../services/productServices';
import { useUser } from '../../context/Context';

interface VariantOption {
  id: number;
  sku: string;
  variant_name: string;
  product_name: string;
  cost_price: number;
}

interface LineItemRow extends CreatePOItemInput {
  key: string;
}

interface PurchaseOrderFormModalProps {
  initial?: PurchaseOrderDetail | null;
  onClose: () => void;
  onSubmit: (data: {
    supplier_id: number;
    order_date: string;
    expected_delivery_date?: string;
    notes?: string;
    items: CreatePOItemInput[];
  }) => Promise<void>;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const PurchaseOrderFormModal: React.FC<PurchaseOrderFormModalProps> = ({
  initial,
  onClose,
  onSubmit,
}) => {
  const { shop } = useUser();
  const isEdit = Boolean(initial);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [variants, setVariants] = useState<VariantOption[]>([]);

  const [supplierId, setSupplierId] = useState<number | ''>(initial?.supplier_id ?? '');
  const [orderDate, setOrderDate] = useState(initial?.order_date?.slice(0, 10) ?? todayStr());
  const [expectedDate, setExpectedDate] = useState(
    initial?.expected_delivery_date?.slice(0, 10) ?? ''
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [items, setItems] = useState<LineItemRow[]>(
    initial?.items?.map((it) => ({
      key: crypto.randomUUID(),
      product_variant_id: it.product_variant_id,
      quantity: it.quantity,
      unit_cost: Number(it.unit_cost),
    })) ?? [{ key: crypto.randomUUID(), product_variant_id: 0, quantity: 1, unit_cost: 0 }]
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shop?.id) return;
    supplierService.getSuppliers(shop.id, undefined, true).then((res) => {
      setSuppliers(res.data ?? []);
    });

    productService
      .getProductWithVariants(shop.id, 'cost_price', 'DESC', 100, 0)
      .then((res) => {
        const products = res.data ?? [];
        const flat: VariantOption[] = [];
        products.forEach((p: any) => {
          (p.variants ?? []).forEach((v: any) => {
            flat.push({
              id: v.id,
              sku: v.sku,
              variant_name: v.variant_name,
              product_name: p.name,
              cost_price: v.cost_price,
            });
          });
        });
        setVariants(flat);
      });
  }, [shop?.id]);

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      { key: crypto.randomUUID(), product_variant_id: 0, quantity: 1, unit_cost: 0 },
    ]);
  };

  const removeRow = (key: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  };

  const updateRow = (key: string, field: keyof CreatePOItemInput, value: number) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.key !== key) return row;
        const updated = { ...row, [field]: value };
        // auto-fill unit cost when a variant is picked, if user hasn't typed one yet
        if (field === 'product_variant_id') {
          const variant = variants.find((v) => v.id === value);
          if (variant && row.unit_cost === 0) {
            updated.unit_cost = variant.cost_price;
          }
        }
        return updated;
      })
    );
  };

  const total = items.reduce((sum, r) => sum + r.quantity * r.unit_cost, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!supplierId) {
      setError('Please select a supplier');
      return;
    }
    if (!orderDate) {
      setError('Order date is required');
      return;
    }
    const validItems = items.filter((it) => it.product_variant_id > 0);
    if (validItems.length === 0) {
      setError('Add at least one product line item');
      return;
    }
    for (const it of validItems) {
      if (it.quantity <= 0) {
        setError('Quantity must be greater than 0 for all items');
        return;
      }
      if (it.unit_cost < 0) {
        setError('Unit cost cannot be negative');
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        supplier_id: Number(supplierId),
        order_date: orderDate,
        expected_delivery_date: expectedDate || undefined,
        notes: notes.trim() || undefined,
        items: validItems.map(({ product_variant_id, quantity, unit_cost }) => ({
          product_variant_id,
          quantity,
          unit_cost,
        })),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? `Edit Purchase Order #${initial?.id}` : 'Create Purchase Order'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier <span className="text-red-500">*</span>
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Select supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Line Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((row) => (
                <div key={row.key} className="flex items-center gap-2">
                  <select
                    value={row.product_variant_id || ''}
                    onChange={(e) => updateRow(row.key, 'product_variant_id', Number(e.target.value))}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="">Select product...</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.product_name} — {v.variant_name} ({v.sku})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) => updateRow(row.key, 'quantity', parseInt(e.target.value) || 0)}
                    placeholder="Qty"
                    className="w-20 rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.unit_cost}
                    onChange={(e) => updateRow(row.key, 'unit_cost', parseFloat(e.target.value) || 0)}
                    placeholder="Unit cost"
                    className="w-28 rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <span className="w-20 text-right text-sm text-gray-600">
                    ${(row.quantity * row.unit_cost).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-end border-t border-gray-200 pt-3">
              <span className="text-sm font-semibold text-gray-900">
                Total: ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderFormModal;
