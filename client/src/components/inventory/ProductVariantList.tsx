import React, { useEffect, useState } from 'react';
import type { InventoryResponseDTO } from '../../types/product';

interface ProductVariant {
  id: number;
  shop_id: number;
  product_id: number;
  product_image_id: number;
  variant_name: string;
  sku: string;
  cost_price: string;
  selling_price: string;
  image_url: string;
  file_name: string;
  inventory:InventoryResponseDTO;
  created_at: string;
  updated_at: string;
}

export interface VariantEdit {
  id: number;
  variant_name: string;
  sku: string;
  cost_price: string;
  selling_price: string;
  inventory_id: number;
  location: string;
  quantity_on_hand: number;
  available_quantity: number;
  damaged_quantity: number;
  low_stock_threshold: number;
}

interface ProductVariantListProps {
  variants: ProductVariant[];
  onEdit?: (variant: ProductVariant) => void;
  onDelete?: (id: number) => void;
  // Called whenever a variant field changes, so parent can track all edits
  onVariantChange?: (edit: VariantEdit) => void;
  isEditingProduct:boolean;
  setActiveId:(id:number)=>void;
  activeId:number;
}

const ProductVariantList: React.FC<ProductVariantListProps> = ({
  variants,
  onEdit,
  onDelete,
  onVariantChange,
  isEditingProduct,
  setActiveId,
  activeId,
}) => {
  // Track which variant ids are in edit mode
  const [editingIds, setEditingIds] = useState<Set<number>>(new Set());
  const [variantcpy, setVariantcpy] = useState(variants);
  // Track draft edits per variant id
  const [drafts, setDrafts] = useState<Record<number, VariantEdit>>({});
  let activeVariant = variantcpy.find(e=>e.id == activeId);

  useEffect(()=>{
    setVariantcpy(variants);
  },[variants]);

  const startEdit = (variant: ProductVariant) => {
    setEditingIds((prev) => new Set(prev).add(variant.id));
    setDrafts((prev) => ({
      ...prev,
      [variant.id]: {
        id: variant.id,
        variant_name: variant.variant_name,
        sku: variant.sku,
        cost_price: variant.cost_price,
        selling_price: variant.selling_price,
        inventory_id: variant.inventory.id,
        location: variant.inventory.location,
        quantity_on_hand: variant.inventory.quantity_on_hand,
        available_quantity: variant.inventory.quantity_on_hand - variant.inventory.damaged_quantity,
        damaged_quantity: variant.inventory.damaged_quantity,
        low_stock_threshold: variant.inventory.low_stock_threshold,
      },
    }));
  };

  const cancelEdit = (id: number) => {
    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleDraftChange = (
    id: number,
    field: keyof Omit<VariantEdit, 'id'>,
    value: string
  ) => {
    let updated: VariantEdit = { ...drafts[id], [field]: value };
    updated = {...updated,available_quantity:updated.quantity_on_hand - updated.damaged_quantity};
    setDrafts((prev) => ({ ...prev, [id]: updated }));
    onVariantChange?.(updated);
  };

  const confirmEdit = (id: number) => {
    // Notify parent with final state
    const variant = drafts[id];

    if (variant) {
      const originalVariant = variants.find(v => v.id === id);
      
      // Check if anything actually changed
      const hasChanges = originalVariant && (
        originalVariant.variant_name !== variant.variant_name ||
        originalVariant.sku !== variant.sku ||
        originalVariant.cost_price !== variant.cost_price ||
        originalVariant.selling_price !== variant.selling_price ||
        originalVariant.inventory.location !== variant.location ||
        originalVariant.inventory.quantity_on_hand !== variant.quantity_on_hand ||
        originalVariant.inventory.available_quantity !== variant.available_quantity ||
        originalVariant.inventory.damaged_quantity !== variant.damaged_quantity ||
        originalVariant.inventory.low_stock_threshold !== variant.low_stock_threshold
      );
      
      // If no changes, just exit edit mode and return early
      if (!hasChanges) {
        setEditingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        return; 
      }

      onVariantChange?.(drafts[id]);

      setVariantcpy(p => {
        return p.map(e => {
          if(e.id !== variant.id) return e;
          return {...e,variant_name:variant.variant_name,
                      cost_price:variant.cost_price,
                      selling_price:variant.selling_price,
                      sku:variant.sku,
                      inventory:{...e.inventory,
                        location:variant.location,
                        quantity_on_hand:variant.quantity_on_hand,
                        available_quantity:variant.quantity_on_hand - variant.damaged_quantity,
                        damaged_quantity:variant.damaged_quantity,
                        low_stock_threshold:variant.low_stock_threshold,
                      },
                    };
        })
      })
    }
    // Keep draft in state so parent always has latest; just exit edit mode
    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  useEffect(() => {
    setEditingIds(prev => new Set());
  }, [isEditingProduct]);

  const handleSetActiveId = (id:number)=>{
    setActiveId(id);
  }

  return (
    <div className="space-y-4">

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Inventory Details</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Available Quantity</p>
            <p className="font-medium text-2xl text-green-500">{activeVariant?.inventory.available_quantity}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Damaged Quantity</p>
            <p className="font-medium text-2xl">{activeVariant?.inventory.damaged_quantity}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Threshold</p>
            <p className="font-medium text-2xl">{activeVariant?.inventory.low_stock_threshold}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg col-span-3 md:col-span-2 h-24 overflow-auto">
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium ">{activeVariant?.inventory.location}</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4">Variants</h3>
      
      {variantcpy.map((variant) => {
        const isEditing = editingIds.has(variant.id);
        const draft = drafts[variant.id];

        const displayCostPrice =  variant.cost_price;
        const displaySellingPrice = variant.selling_price;

        const cost = parseFloat(displayCostPrice) || 0;
        const selling = parseFloat(displaySellingPrice) || 0;
        const profit = (selling - cost).toFixed(2);
        const margin = cost > 0 ? (((selling - cost) / cost) * 100).toFixed(1) : '0';

        return (
        
          <div key={variant.id}>
            <div
              onClick={()=>handleSetActiveId(variant.id)}

              className={`mb-2 group flex items-center gap-2 border  border-t  p-3 transition-all duration-200 hover:shadow-sm ${
                isEditing ? 'bg-blue-50 border border-blue-200 rounded-xl' : 'hover:bg-gray-50'
              } ${activeId == variant.id? 'border border-dashed border-green-500 rounded-lg': ' border-transparent border-t-gray-200'}`}
            >
              {/* Product Image */}
              <div className="w-20 h-20 flex justify-center items-center  p-2 border border-gray-200 overflow-hidden rounded-xl">
                <img
                  src={variant.image_url}
                  alt={variant.variant_name}
                  className="h-full object-cover"
                />
              </div>

              {/* Variant Details */}
              <div className="flex-1 min-w-0">

                <div className="flex flex-col  gap-3 mb-1">
                  <h3 className="font-semibold text-lg text-gray-800 truncate">
                    {variant.variant_name}
                  </h3>
                  <p className="text-sm text-gray-500">SKU: {variant.sku}</p>
                </div>
                
              </div>

              {/* Pricing Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {/* Cost Price */}
                <div className="hidden md:block">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                    Cost Price
                  </p>

                    <p className="text-lg font-medium text-gray-700">${cost.toFixed(2)}</p>
 
                </div>

                {/* Selling Price */}
                <div className="hidden md:block">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                    Selling Price
                  </p>

                    <p className="text-xl font-medium text-green-600">${selling.toFixed(2)}</p>

                </div>

                {/* Profit (always read-only — derived) */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                    Profit
                  </p>
                  <div className="flex flex-col items-center">
                    <p className="text-xl font-medium text-emerald-600">${profit}</p>
                    <span className="text-sm text-emerald-500 font-medium">({margin}%)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditingProduct &&
              (
              <div className="flex flex-col gap-2 ml-2 flex-shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => confirmEdit(variant.id)}
                      className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-2xl hover:scale-105 transition"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => cancelEdit(variant.id)}
                      className="px-3 py-1.5 text-xs font-semibold  bg-gray-200 text-red-500 rounded-2xl hover:scale-105 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(variant)}
                      className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-gray-50 rounded-2xl hover:scale-105  transition"
                    >
                      Edit
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(variant.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-gray-200 text-red-400 rounded-2xl hover:scale-105  transition"
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              
              </div>
              )}

            </div>
            {isEditingProduct && isEditing && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
                {/* Main row: Variant name + SKU */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Variant name
                    </label>
                    <input
                      type="text"
                      value={draft.variant_name}
                      onChange={(e) =>
                        handleDraftChange(variant.id, 'variant_name', e.target.value)
                      }
                      className="w-full px-4 py-2.5 text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all duration-200"
                      placeholder="e.g., Leather Black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={draft.sku}
                      onChange={(e) => handleDraftChange(variant.id, 'sku', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all duration-200"
                      placeholder="SKU-001"
                    />
                  </div>
                </div>

                {/* Location + Quantity on hand */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={draft.location}
                      onChange={(e) => handleDraftChange(variant.id, 'location', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all duration-200"
                      placeholder="Warehouse A"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      On hand qty
                    </label>
                    <input
                      type="text"
                      value={draft.quantity_on_hand}
                      onChange={(e) =>
                        handleDraftChange(variant.id, 'quantity_on_hand', e.target.value)
                      }
                      className="w-full px-4 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Price & quantity badge row */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                    <span className="text-xs font-medium text-gray-500">Cost</span>
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={draft.cost_price}
                      onChange={(e) =>
                        handleDraftChange(variant.id, 'cost_price', e.target.value)
                      }
                      className="w-24 px-2 py-1 text-sm text-center font-medium text-gray-700 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                    <span className="text-xs font-medium text-green-600">Sell</span>
                    <span className="text-green-400">$</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={draft.selling_price}
                      onChange={(e) =>
                        handleDraftChange(variant.id, 'selling_price', e.target.value)
                      }
                      className="w-24 px-2 py-1 text-sm text-center font-semibold text-green-700 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-green-300 rounded-lg"
                    />
                  </div>



                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                    <span className="text-xs font-medium text-gray-500">Threshold</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={draft.low_stock_threshold}
                      onChange={(e) =>
                        handleDraftChange(variant.id, 'low_stock_threshold', e.target.value)
                      }
                      className="w-24 px-2 py-1 text-sm text-center text-gray-700 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                    <span className="text-xs font-medium text-red-500">Damaged</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={draft.damaged_quantity}
                      onChange={(e) =>
                        handleDraftChange(variant.id, 'damaged_quantity', e.target.value)
                      }
                      className="w-24 px-2 py-1 text-sm text-center text-red-600 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {variants.length === 0 && (
        <div className="text-center py-12 text-gray-500">No variants found</div>
      )}
    </div>
  );
};

export default ProductVariantList;
