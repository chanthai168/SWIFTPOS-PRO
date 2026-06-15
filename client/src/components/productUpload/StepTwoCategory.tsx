// src/components/ProductUpload/Step2Category.tsx
import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productServices';
import type { Category } from '../../types/product';

import { plusIcon } from './Icons';

const angleIcon = <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 640 640">
	<path d="M0 0h640v640H0z" fill="none" />
	<path fill="currentColor" d="M201.4 297.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L269.3 320l137.3-137.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
</svg>




interface Step2CategoryProps {
  shopId: number;
  formData: {
    category_id: number | null;
    id?:number;
  };
  updateFormData: (updates: any) => void;
  onBack: () => void;
  onNext: () => void;
}

const Step2Category: React.FC<Step2CategoryProps> = ({
  shopId,
  formData,
  updateFormData,
  onBack,
  onNext,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    loadCategories();
    
  }, [shopId]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const response = await productService.getCategories(shopId);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      setErrors({ name: 'Category name is required' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await productService.createCategory(shopId, newCategory);
      console.log("respone here")
      console.log(response);
      await loadCategories();
      updateFormData({ category_id: response.data.category_id,category_name:newCategory.name});
      setIsCreating(false);
      setNewCategory({ name: '', description: '' });
      setErrors({});
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.message || 'Failed to create category' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Category</h2>

      {isCreating ? (
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Clothing"
              autoFocus
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Category description..."
            />
          </div>

          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Category'}
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Category
            </label>
            <div className="space-y-2">
              <label   className={`flex items-center p-3 border bg-layer3 border-gray-300 rounded-lg transition-all
                          ${formData.id != null
                            ? "opacity-50 cursor-not-allowed" 
                            : "hover:bg-gray-200 cursor-pointer"
                          }`}>
                <input
                  type="radio"
                  name="category"
                  checked={formData.category_id === null}
                  onChange={() => updateFormData({ category_id: null,category_name:'No category' })}
                  className="w-4 h-4 text-blue-600"
                  disabled={formData.id != null }
                />
                <span className="ml-3 text-sm text-gray-600">No Category</span>
              </label>

              {isLoading ? (
                <p className="text-center py-4 text-gray-500">Loading categories...</p>
              ) : (
                categories.map((category) => (
                  <label
                    key={category.id}
                    className={`flex items-center p-3 border bg-layer3 border-gray-300 rounded-lg transition-all
                          ${formData.id != null
                            ? "opacity-50 cursor-not-allowed" 
                            : "hover:bg-gray-200 cursor-pointer"
                          }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={formData.category_id === category.id}
                      onChange={() => updateFormData({ category_id: category.id,category_name:category.name })}
                      className="w-4 h-4 text-blue-600"
                      disabled={formData.id != null }
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{category.name}</p>
                      {category.description && (
                        <p className="text-sm text-gray-500">{category.description}</p>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>

            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              {plusIcon}
              Create New Category
            </button>
          </div>
        </>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 border flex items-center border-gray-300 text-gray-700 font-medium rounded-4xl hover:bg-gray-50"
        >
          {angleIcon} Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 flex items-center bg-blue-600 text-white font-medium rounded-4xl hover:bg-blue-700"
        >
          Next: Variants <span className=' rotate-180'>{angleIcon}</span>
        </button>
      </div>
    </div>
  );
};

export default Step2Category;