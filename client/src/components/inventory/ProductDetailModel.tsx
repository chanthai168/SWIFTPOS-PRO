

import React, { useState } from 'react';
import { Pencil, Check, X, Edit } from 'lucide-react';
import ProductVariantList from './ProductVariantList';
import type { VariantEdit } from './ProductVariantList';
import type { ProductDetailResponseDTO, ProductVariantResponseDTO } from '../../types/product';
import { AxiosError } from 'axios';
import { productService } from '../../services/productServices';
import { useUser } from '../../context/Context';
import { useNotification,NotificationContainer } from '../../public/Notify';

interface ProductDetailModalProps {
  selectedProduct: ProductDetailResponseDTO;
  onClose: () => void;
  getStockStatus: (variant: ProductVariantResponseDTO) => string;
  getStockColor: (variant: ProductVariantResponseDTO) => string;
  setData:React.Dispatch<React.SetStateAction<ProductDetailResponseDTO[]>>;
  reFetch:()=> any;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  selectedProduct,
  onClose,
  getStockStatus,
  getStockColor,
  setData,
  reFetch,
}) => {

  const {notify,notifications} = useNotification(); 

  // ── product-level edit state ──
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productEdits, setProductEdits] = useState<{
    id:number;
    name: string;
    description: string;
    sku: string;
    is_active: boolean;
  } | null>(null);

  const {shop} = useUser();

  // ── variant-level edit state ──
  const [variantEdits, setVariantEdits] = useState<Record<number, VariantEdit>>({});

  const [activeId,setActiveId] = useState(selectedProduct.variants[0].id);

  const startEditProduct = () => {
    setProductEdits({
      id:selectedProduct.id,
      name: selectedProduct.name,
      description: selectedProduct.description ?? '',
      sku: selectedProduct.sku,
      is_active: selectedProduct.is_active,
    });
    setIsEditingProduct(true);
  };

  let activeVariant = selectedProduct.variants.find(e=>e.id == activeId);

  const cancelEditProduct = () => {
    setIsEditingProduct(false);
    setProductEdits(null);
  };

  const saveUpdate = () => {
    // productEdits holds the updated values – wire up your API call here
    setIsEditingProduct(false);
    handleUpdate();

    if(Object.keys(variantEdits).length > 0){
      handleVariantUpdate();
    }

    setProductEdits(null);
    setIsEditingProduct(false);
  };


  const handleVariantChange = (edit: VariantEdit) => {
    setVariantEdits((prev) => ({ ...prev, [edit.id]: edit }));
  };

  const handleUpdate = async ()=>{
    try{
      if(selectedProduct.name == productEdits?.name 
        && selectedProduct.description == productEdits.description
        && selectedProduct.is_active == productEdits.is_active
        && Object.keys(variantEdits).length == 0
      ){
        notify('error','Nothing to update');
        return;
      }
      if(!productEdits){
        notify('error','Nothing to update');
        return;
      }

    setData((prev) =>
      prev.map((p) => {
        if(p.id !== productEdits.id) return p;
        if(productEdits.description && productEdits.description != p.description) p.description = productEdits.description;
        if(productEdits.name && productEdits.name != p.name) p.name = productEdits.name;
        return p;
      })
    );

      const res = await productService.updateProduct(shop?.id as number,productEdits);
      if(res.success){
        notify("success", "Product update successfully");
      }
    }
    catch(error){
      notify('error','Something went wrong');
      await reFetch();
      if (error instanceof AxiosError) notify("error", error.message);
    }
  }

  const handleVariantUpdate = async ()=>{
  
    try{
      if (Object.keys(variantEdits).length === 0) {
        notify('error','Nothing to update about variants');
        return;
      }

      if (!shop?.id || !selectedProduct.id) return notify('error', 'Unauthorized');
      
      console.log(variantEdits);
      
      setData(prev =>
        prev.map(p =>
          p.id !== selectedProduct.id
            ? p
            : {
                ...p,
                variants: p.variants.map(variant =>
                  variant.id in variantEdits
                    ? {
                        ...variant,
                        inventory:variant.inventory ? { ...variant.inventory,
                                                      location:variantEdits[variant.id].location,
                                                      quantity_on_hand:variantEdits[variant.id].quantity_on_hand,
                                                      available_quantity:variantEdits[variant.id].available_quantity,
                                                      damaged_quantity:variantEdits[variant.id].damaged_quantity,
                                                      low_stock_threshold:variantEdits[variant.id].low_stock_threshold,
                                                     } : null,
                        cost_price: Number(variantEdits[variant.id].cost_price),
                        selling_price: Number(variantEdits[variant.id].selling_price),
                        variant_name: variantEdits[variant.id].variant_name,
                        sku:variantEdits[variant.id].sku,
                      }
                    : variant
                ),
              }
        )
      );

      const result = await productService.updateVariants(shop.id as number,selectedProduct.id,variantEdits);
      // if(result.success){
      //   notify("success", "Product update successfully");
      // }

    }
    catch(error){
      notify('error','Something went wrong with variant update!');
      await reFetch();
      if (error instanceof AxiosError) notify("error", error.message);
    }
    finally{
      // setProductEdits(null);
      setVariantEdits({});
    }
  }

  const handleSubmit = async ()=>{
    handleUpdate();
    handleVariantUpdate();
  }


  const listVariants = selectedProduct.variants.map((v) => ({
    id: v.id,
    shop_id: 0,
    product_id: selectedProduct.id,
    product_image_id: v.image?.id ?? 0,
    variant_name: v.variant_name,
    sku: v.sku,
    cost_price: String(v.cost_price),
    selling_price: String(v.selling_price),
    image_url: v.image?.image_url ?? '',
    file_name: v.image?.file_name ?? '',
    inventory: v.inventory!,
    created_at: selectedProduct.created_at,
    updated_at: selectedProduct.created_at,
  }));

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-4xl w-full max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

      {/* notification*/}
      <NotificationContainer notifications={notifications} />

        {/* ── Sticky Header ── */}
        <div className="sticky top-0 bg-white border-b-4 border-primary px-6 py-4 flex justify-between items-center z-10">
          {isEditingProduct ? (
            <input
              value={productEdits?.name ?? ''}
              onChange={(e) =>
                setProductEdits((prev) => prev ? { ...prev, name: e.target.value } : prev)
              }
              className="text-2xl font-bold text-gray-900 border-b-2focus:outline-none bg-transparent w-full mr-4"
            />
          ) : (
            <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Edit / Confirm / Cancel product */}
            {isEditingProduct ? (
              <>
                <button
                  type="button"
                  onClick={saveUpdate}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-2xl hover:scale-104 transition"
                >
                  <Check size={15} /> Save
                </button>
                <button
                  type="button"
                  onClick={cancelEditProduct}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-sm font-semibold  text-red-500 rounded-2xl hover:scale-104 transition"
                >
                  <X size={15} /> Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEditProduct}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 font-semibold  text-gray-600 rounded-2xl hover:scale-104 transition"
              >
                <Pencil size={14} /> Edit
              </button>
            )}

            {/* Close */}
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 ml-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">

          {/* ── Product Details ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* Image */}
            <div className="flex justify-center items-center bg-gray-100 rounded-lg">
              {activeVariant?.image ? (
                <img
                  src={activeVariant?.image?.image_url}
                  alt={activeVariant.variant_name}
                  className="h-68 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info fields */}
            <div>
                {!true ? (
                    <div>
                        <p>Category Editable</p>
                    </div>
                ):(
                    <div className="mb-4">
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium">{selectedProduct.category.name}</p>
                    </div>
                )}


              <div className="mb-4">
                <p className="text-sm text-gray-500">{productEdits ? "Product Name":"SKU"}</p>
                {isEditingProduct ? (
                  <input
                    value={productEdits?.name ?? ''}
                    onChange={(e) =>
                      setProductEdits((prev) => prev ? { ...prev, name: e.target.value } : prev)
                    }
                    className="w-full px-3 py-1.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                ) : (
                  <p className="font-medium">{selectedProduct.variants[0]?.sku}</p>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500">Description</p>
                {isEditingProduct ? (
                  <textarea
                    rows={3}
                    value={productEdits?.description ?? ''}
                    onChange={(e) =>
                      setProductEdits((prev) => prev ? { ...prev, description: e.target.value } : prev)
                    }
                    className="w-full px-3 py-1.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                ) : (
                  <p className="text-gray-700">{selectedProduct.description}</p>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500">Status</p>
                {isEditingProduct ? (
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={productEdits?.is_active ?? true}
                      onChange={(e) =>
                        setProductEdits((prev) =>
                          prev ? { ...prev, is_active: e.target.checked } : prev
                        )
                      }
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                ) : (
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      selectedProduct.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedProduct.is_active ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-sm">{new Date(selectedProduct.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          {/* ── Inventory summary (first variant, read-only) ── */}
          {/* {activeVariant && activeVariant.inventory && (
            // <div className="mt-6">
            //   <h3 className="text-xl font-semibold mb-4">Inventory Details</h3>
            //   <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            //     <div className="bg-gray-100 p-4 rounded-lg">
            //       <p className="text-sm text-gray-500">Available Quantity</p>
            //       <p className="font-medium text-2xl text-green-500">{activeVariant.inventory.available_quantity}</p>
            //     </div>
            //     <div className="bg-gray-100 p-4 rounded-lg">
            //       <p className="text-sm text-gray-500">Damaged Quantity</p>
            //       <p className="font-medium text-2xl">{activeVariant.inventory.damaged_quantity}</p>
            //     </div>
            //     <div className="bg-gray-100 p-4 rounded-lg">
            //       <p className="text-sm text-gray-500">Threshold</p>
            //       <p className="font-medium text-2xl">{activeVariant.inventory.low_stock_threshold}</p>
            //     </div>
            //     <div className="bg-gray-100 p-4 rounded-lg col-span-3 md:col-span-2 h-24 overflow-auto">
            //       <p className="text-sm text-gray-500">Location</p>
            //       <p className="font-medium ">{activeVariant.inventory.location}</p>
            //     </div>
            //   </div>
            // </div>
          )} */}

          {/* ── Variants – editable via ProductVariantList ── */}
          <div>
            
            <ProductVariantList
              variants={listVariants}
              onVariantChange={handleVariantChange}
              onDelete={(id) => console.log('Delete variant:', id)}
              isEditingProduct={isEditingProduct}
              setActiveId={setActiveId}
              activeId={activeId}
            />
          </div>


          {/* ── Submit all edits button (shown only when there are pending edits) ── */}
          {/* {(isEditingProduct ) && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleVariantUpdate}
                className="px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:scale-103 transition"
              >
                Submit All Changes
              </button>
            </div>
          )} */}

        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
