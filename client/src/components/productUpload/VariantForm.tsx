// src/components/ProductUpload/VariantForm.tsx
import React, { useState, useRef } from 'react';
import type { ProductVariant } from '../../types/product';

interface VariantFormProps {
  onSubmit: (variant: ProductVariant) => void;
  onCancel: () => void;
}

const VariantForm: React.FC<VariantFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ProductVariant>>({
    sku: '',
    variant_name: '',
    cost_price: 0,
    selling_price: 0,
    stock_quantity: 0,
    location: '',
    low_stock_threshold: 5,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.sku?.trim()) newErrors.sku = 'SKU is required';
    if (!formData.variant_name?.trim()) newErrors.variant_name = 'Variant name is required';
    if (formData.cost_price === undefined || formData.cost_price === null || formData.cost_price < 0) 
      newErrors.cost_price = 'Valid cost price required';
    if (formData.selling_price === undefined || formData.selling_price === null || formData.selling_price < 0) 
      newErrors.selling_price = 'Valid selling price required';
    if (formData.stock_quantity === undefined || formData.stock_quantity === null || formData.stock_quantity < 0) 
      newErrors.stock_quantity = 'Valid stock quantity required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNumberChange = (field: keyof ProductVariant, value: string) => {
    // Handle empty string or invalid input
    if (value === '' || value === '-') {
      setFormData({ ...formData, [field]: 0 });
      return;
    }
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData({ ...formData, [field]: numValue });
    }
  };

  const handleIntegerChange = (field: keyof ProductVariant, value: string) => {
    if (value === '') {
      setFormData({ ...formData, [field]: 0 });
      return;
    }
    
    const intValue = parseInt(value, 10);
    if (!isNaN(intValue)) {
      setFormData({ ...formData, [field]: intValue });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    onSubmit({
      sku: formData.sku!,
      variant_name: formData.variant_name!,
      cost_price: Number(formData.cost_price) || 0,
      selling_price: Number(formData.selling_price) || 0,
      stock_quantity: Number(formData.stock_quantity) || 0,
      location: formData.location || '',
      low_stock_threshold: formData.low_stock_threshold || 5,
      image: imageFile || undefined,
      imagePreview: imagePreview || undefined,
    });

    // Reset form
    setFormData({
      sku: '',
      variant_name: '',
      cost_price: 0,
      selling_price: 0,
      stock_quantity: 0,
      location: '',
      low_stock_threshold: 5,
    });
    setImageFile(null);
    setImagePreview('');
    setErrors({});
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ image: 'Image must be less than 5MB' });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-layer3 border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Variant</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.sku ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., TSH-RED-S"
          />
          {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku}</p>}
        </div>

        {/* Variant Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variant Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.variant_name}
            onChange={(e) => setFormData({ ...formData, variant_name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.variant_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Red / Small"
          />
          {errors.variant_name && <p className="mt-1 text-xs text-red-500">{errors.variant_name}</p>}
        </div>

        {/* Cost Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Price ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.cost_price}
            onChange={(e) => handleNumberChange('cost_price', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.cost_price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {errors.cost_price && <p className="mt-1 text-xs text-red-500">{errors.cost_price}</p>}
        </div>

        {/* Selling Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selling Price ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.selling_price}
            onChange={(e) => handleNumberChange('selling_price', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.selling_price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {errors.selling_price && <p className="mt-1 text-xs text-red-500">{errors.selling_price}</p>}
        </div>

        {/* Stock Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={(e) => handleIntegerChange('stock_quantity', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.stock_quantity ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
          />
          {errors.stock_quantity && <p className="mt-1 text-xs text-red-500">{errors.stock_quantity}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Shelf A1"
          />
        </div>

        {/* Low Stock Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Low Stock Threshold
          </label>
          <input
            type="number"
            min="0"
            value={formData.low_stock_threshold}
            onChange={(e) => handleIntegerChange('low_stock_threshold', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="5"
          />
        </div>

        {/* Image Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image
          </label>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              required
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Choose Image
            </button>
            {imagePreview && (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="h-20  object-cover rounded" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Add Variant
        </button>
      </div>
    </form>
  );
};

export default VariantForm;