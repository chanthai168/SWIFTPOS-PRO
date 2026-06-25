// src/components/ProductUpload/Step3Variants.tsx
import React, { useState } from 'react';
import VariantForm from './VariantForm';
import type { ProductVariant } from '../../types/product';
import { useEffect } from 'react';
import ProductVariantList from './ProductVariantList';
const angleIcon = <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 640 640">
	<path d="M0 0h640v640H0z" fill="none" />
	<path fill="currentColor" d="M201.4 297.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L269.3 320l137.3-137.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
</svg>

import { plusIcon } from './Icons';

interface Step3VariantsProps {
  shopId: number;
  formData: {
    name: string;
    id?:number;
    description: string;
    category_id: number | null;
    category_name?: string | null;
    is_active: boolean;
    variants: ProductVariant[];
  };
  addVariant: (variant: ProductVariant) => void;
  removeVariant: (index: number) => void;
  getVariants: (productId?:number) => any;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isFetchVariantLoading:boolean;
  productVariants: any[];
}

const Step3Variants: React.FC<Step3VariantsProps> = ({
  formData,
  addVariant,
  removeVariant,
  onBack,
  onSubmit,
  isLoading,
  getVariants,
  isFetchVariantLoading,
  productVariants,
}) => {
  const [showVariantForm, setShowVariantForm] = useState(false);



  const handleAddVariant = (variant: ProductVariant) => {
    addVariant(variant);
    setShowVariantForm(false);
  };

  useEffect(()=>{
    
    getVariants();
    
    if(formData.id){
      getVariants(formData.id);
    }

  },[])
  
  console.log(formData);
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Variants</h2>


      <div className="mb-6 p-4 bg-gray-100  rounded-lg">
        <p className=' text-gray-500 '>Product</p>
        <p >
          <span className=' text-2xl text-gray-700 font-medium'>{formData.name} |</span> <span className=' text-gray-500'>{formData.category_name}</span>
        </p>

      </div>

      <div>
        {isFetchVariantLoading && (
          <p>loading...</p>
        )}
        {productVariants.length > 0 && (
          <h2 className=' mb-2'>Existing variants</h2>
        )}
        {productVariants.length > 0 && (
          
          <ProductVariantList
            variants={productVariants}
            onEdit={(variant) => console.log('Edit variant:', variant)}
            onDelete={(id) => console.log('Delete variant ID:', id)}
          />
        )}

      </div>

      {/* Variants List */}
      {formData.variants.length > 0 ? (
        <div className="mb-6 space-y-3">
          <h3 className="font-medium text-gray-900">
            Variants ({formData.variants.length})
          </h3>
          {formData.variants.map((variant, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {variant.imagePreview && (
                    <img
                      src={variant.imagePreview}
                      alt={variant.variant_name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{variant.variant_name}</p>
                    <p className="text-sm text-gray-500">SKU: {variant.sku}</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-gray-600">
                    Cost: <span className="font-medium">${variant.cost_price}</span>
                  </span>
                  <span className="text-gray-600">
                    Price: <span className="font-medium">${variant.selling_price}</span>
                  </span>
                  <span className="text-gray-600">
                    Stock: <span className="font-medium">{variant.stock_quantity}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeVariant(index)}
                className="ml-4 text-red-600 hover:text-red-700 p-2"
                title="Remove variant"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6 p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No variants added yet</p>
          <p className="text-sm text-gray-400 mt-1">Add at least one variant to continue</p>
        </div>
      )}

      {/* Add Variant Button/Form */}
      {showVariantForm ? (
        <div className="mb-6">
          <VariantForm
            onSubmit={handleAddVariant}
            onCancel={() => setShowVariantForm(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowVariantForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center"
        >
          {plusIcon}
          Add Variant
        </button>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 flex items-center border border-gray-300 text-gray-700 font-medium rounded-4xl hover:bg-gray-50"
        >
          {angleIcon} Back
        </button>
        <button
          onClick={onSubmit}
          disabled={formData.variants.length === 0 || isLoading}
          className="px-8 py-2 bg-green-600 text-white font-medium rounded-4xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </>
          ) : (
            'Create Product'
          )}
        </button>
      </div>
    </div>
  );
};

export default Step3Variants;