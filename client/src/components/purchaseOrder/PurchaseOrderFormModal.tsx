import React, { useEffect, useState, useRef } from 'react';
import { X, Plus, Trash2, Search, ChevronDown, Check } from 'lucide-react';
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

// Custom Product Dropdown Component - Fixed types
interface ProductDropdownProps {
  value: number | string;
  onChange: (key: string, field: keyof CreatePOItemInput, value: number) => void;
  variants: VariantOption[];
  rowKey: string;
}

const ProductDropdown: React.FC<ProductDropdownProps> = ({ 
  value, 
  onChange, 
  variants, 
  rowKey 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedVariant = variants.find(v => v.id === Number(value));
  
  const filteredVariants = variants.filter(v => 
    v.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.variant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1 " ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-all duration-200 hover:border-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <span className={selectedVariant ? 'text-gray-700 truncate' : 'text-gray-400'}>
          {selectedVariant 
            ? `${selectedVariant.product_name} — ${selectedVariant.variant_name}`
            : 'Select product...'}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 max-h-60 overflow-y-scroll -top-64 mt-1.5 w-full mb-4 min-w-[280px] rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          {/* Search bar */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-gray-300 px-3 py-2 pl-9 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto ">
            {filteredVariants.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                No products found
              </div>
            ) : (
              filteredVariants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    onChange(rowKey, 'product_variant_id', v.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="w-full flex items-center border-b border-gray-300 justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 transition-colors duration-150 group"
                >
                  <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                    <span className="font-medium truncate w-full text-left">
                      {v.product_name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{v.variant_name}</span>
                      <span className="text-gray-300">•</span>
                      <span className="font-mono">{v.sku}</span>
                      <span className="text-gray-300">•</span>
                      <span className="font-medium text-primary">
                        ${v.cost_price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {Number(value) === v.id && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const MODAL_TRANSITION_MS = 220;

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
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 10);
    return () => window.clearTimeout(timer);
  }, []);

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

  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => onClose(), MODAL_TRANSITION_MS);
  };

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

  const [supplierSearch, setSupplierSearch] = useState('');
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const supplierRef = useRef<HTMLDivElement>(null);

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const selectedSupplier = suppliers.find(s => s.id === Number(supplierId));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (supplierRef.current && !supplierRef.current.contains(event.target as Node)) {
        setIsSupplierOpen(false);
        setSupplierSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6 transition-opacity duration-300 ease-out ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`w-full max-w-3xl border border-white  overflow-y-auto rounded-4xl p-2 bg-white shadow-xl transition-all duration-300 ease-out ${
          isVisible && !isClosing ? 'translate-y-0 scale-100 opacity-80' : '-translate-y-4 scale-80 opacity-0'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? `Edit Purchase Order #${initial?.id}` : 'Create Purchase Order'}
          </h2>
          <button
            onClick={requestClose}
            className="rounded-full bg-gray-200 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          <div className="p-2 rounded-3xl">
            <div className="grid grid-cols-3 gap-4">
              {/* Supplier Dropdown */}
              <div className="col-span-1" ref={supplierRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSupplierOpen(!isSupplierOpen)}
                    className="w-full flex items-center justify-between rounded-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-all duration-200 hover:border-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <span className={selectedSupplier ? 'text-gray-700 truncate' : 'text-gray-400'}>
                      {selectedSupplier?.name || 'Select supplier...'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${isSupplierOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSupplierOpen && (
                    <div className="absolute z-50 mt-1.5 w-full min-w-[200px] rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search suppliers..."
                            value={supplierSearch}
                            onChange={(e) => setSupplierSearch(e.target.value)}
                            className="w-full rounded-full border border-gray-300 px-3 py-2 pl-9 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {filteredSuppliers.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-400 text-center">
                            No suppliers found
                          </div>
                        ) : (
                          filteredSuppliers.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setSupplierId(s.id);
                                setIsSupplierOpen(false);
                                setSupplierSearch('');
                              }}
                              className="w-full flex items-center border-b border-gray-300 justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 transition-colors duration-150"
                            >
                              <span className="truncate">{s.name}</span>
                              {Number(supplierId) === s.id && (
                                <Check className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Note something..."
                className="w-full rounded-xl border border-dashed border-gray-400 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Line Items <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addRow}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              <div className="space-y-2 p-2">
                {items.map((row) => (
                  <div key={row.key} className="flex items-center gap-2">
                    {/* Product Dropdown - Using the fixed component */}
                    <ProductDropdown
                      value={row.product_variant_id}
                      onChange={updateRow}
                      variants={variants}
                      rowKey={row.key}
                    />

                    <input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(e) => updateRow(row.key, 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="Qty"
                      className="w-20 rounded-full border border-gray-300 px-2 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.unit_cost}
                      onChange={(e) => updateRow(row.key, 'unit_cost', parseFloat(e.target.value) || 0)}
                      placeholder="Unit cost"
                      className="w-28 rounded-full border border-gray-300 px-2 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={requestClose}
              className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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