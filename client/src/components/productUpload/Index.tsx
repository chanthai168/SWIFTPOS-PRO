// src/components/ProductUpload/index.tsx
import React, { useState } from 'react';
import Step1Product from './StepOneProduct';
import Step2Category from './StepTwoCategory';
import Step3Variants from './StepThreeVariants';
import type { ProductFormData,ProductVariant } from '../../types/product';
import { productService } from '../../services/productServices';
import { buildProductFormData } from '../../utils/ProductFormData';

interface ProductUploadProps {
  shopId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProductUpload: React.FC<ProductUploadProps> = ({ shopId, onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category_id: null,
    is_active: true,
    variants: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchVariantLoading, setIsFetchVariantLoading] = useState(false);
  const [productVariant,setProductVariant] = useState<any>([]);

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const addVariant = (variant: ProductVariant) => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, variant],
    }));
  };

  const clearProductVariant = () => {
    setFormData(prev => ({...prev,variants:[]}));
  }

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {


      const flatedData = buildProductFormData(formData);

      const res = await productService.createProductWithVariants(shopId,flatedData);

      if(onSuccess){
        onSuccess();
      }
      
      clearProductVariant();
      getVariants(res.productId);
      setFormData(prev=> ({...prev,id:res.productId}));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };


  const getVariants = async(productId?:number) => {
    setIsFetchVariantLoading(true);

    // if productId not provid meaning clear product variant from list
    if(!productId){
      setProductVariant([]);
      setIsFetchVariantLoading(false);
      return;
    }

    try {
      const response = await productService.getVariants(shopId,productId);
      setProductVariant(response.data);
    } catch (error) {
      console.log('Failed to load products variants:', error);
    } finally {
      setIsFetchVariantLoading(false);
    }
  }

  const steps = [
    { number: 1, title: 'Product', description: 'Basic information' },
    { number: 2, title: 'Category', description: 'Classification' },
    { number: 3, title: 'Variants', description: 'Sizes, colors, prices' },
  ];

  return (
    <div className="min-h-screen bg-layer1 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto ">
        {/* Header */}
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete all steps to create a new product with variants
          </p>
        </div> */}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-xs rotate-45 flex items-center justify-center font-semibold text-sm transition-colors ${
                      currentStep >= step.number
                        ? 'bg-blue-500 text-gray-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <span className=' -rotate-45'>{step.number}</span>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      currentStep > step.number ? 'bg-linear-to-r from-cyan-400 to-blue-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-layer2 rounded-3xl shadow-lg p-6 sm:p-8">
          {currentStep === 1 && (
            <Step1Product
              shopId={shopId}
              formData={formData}
              updateFormData={updateFormData}
              onNext={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 2 && (
            <Step2Category
              shopId={shopId}
              formData={formData}
              updateFormData={updateFormData}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}
          {currentStep === 3 && (
            <Step3Variants
              shopId={shopId}
              formData={formData}
              addVariant={addVariant}
              removeVariant={removeVariant}
              onBack={() => setCurrentStep(2)}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              getVariants={getVariants}
              isFetchVariantLoading={isFetchVariantLoading}
              productVariants={productVariant}
            />
          )}
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <div className="mt-6 text-center">
            <button
              onClick={onCancel}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel and go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductUpload;