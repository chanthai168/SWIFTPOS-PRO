// src/components/ProductUpload/Step1Product.tsx
import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productServices';
import type { Product } from '../../types/product';
const searchIcon = <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
  <path d="M0 0h24v24H0z" fill="none" />
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314" />
</svg>;

const angleIcon = <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 640 640">
	<path d="M0 0h640v640H0z" fill="none" />
	<path fill="currentColor" d="M201.4 297.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L269.3 320l137.3-137.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
</svg>

const plusIcon =             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 50 50">
              <path d="M0 0h50v50H0z" fill="none" />
              <path fill="currentColor" d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17s-7.6 17-17 17m0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15s15-6.7 15-15s-6.7-15-15-15" />
              <path fill="currentColor" d="M16 24h18v2H16z" />
              <path fill="currentColor" d="M24 16h2v18h-2z" />
            </svg>;

interface Step1ProductProps {
  shopId: number;
  formData: {
    name: string;
    description: string;
    is_active: boolean;
  };
  updateFormData: (updates: any) => void;
  onNext: () => void;
}


const Step1Product: React.FC<Step1ProductProps> = ({
  shopId,
  formData,
  updateFormData,
  onNext,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (search?: string) => {
    setIsLoading(true);
    try {
      const response = await productService.getProducts(shopId, search);
      setProducts(response.data || []);
    } catch (error) {
      console.log('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    loadProducts(value);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    updateFormData({
      id:product.id,
      name: product.name,
      category_id:product.category_id,
      category_name:product.category_name,
      description: product.description || '',
      is_active: product.is_active,
    });
  };

  const handleCreateNew = () => {
    setSelectedProduct(null);
    updateFormData({
      id:null,
      name: '',
      category_id:null,
      category_name:'',
      description: '',
      is_active: true,
    });
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-medium text-gray-900 mb-6">Product Information</h2>

      {/* Search Existing Product */}
      <div className="mb-6">
        <div className=' flex items-center bg-gray-200 px-4 py-1  rounded-4xl'>
          <label htmlFor='search' className='text-gray-600'>{searchIcon}</label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search product by name..."
            className="w-full px-2 py-2 font-medium rounded-lg  focus:outline-0"
          />
        </div>

      </div>

      {/* Product List */}
      {products.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Select an existing product:</p>
          <div className="max-h-48 overflow-y-auto bg-layer3 rounded-lg border border-gray-300">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-300 last:border-b-0 ${
                  selectedProduct?.id === product.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.description}</p>
                  </div>
                  {product.category_name ?  (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                      {product.category_name}
                    </span>
                  ): (
                    <span className="text-xs bg-yellow-50 text-red-400 px-2 py-1 rounded">
                      None
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={handleCreateNew}
            className="mt-2 text-sm flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            {plusIcon}Create new product instead
          </button>
        </div>
      )}

      <div className="border-t border-gray-200 pt-6">
        {/* Product Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {updateFormData({ name: e.target.value,id:null,category_id:null,category_name:'' })}}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., T-Shirt Premium"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value,id:null,category_id:null,category_name:'' })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Product description..."
          />
        </div>

      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 flex items-center text-white font-medium rounded-4xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Next: Category <span className=' rotate-180'>{angleIcon}</span>
        </button>
      </div>
    </div>
  );
};

export default Step1Product;