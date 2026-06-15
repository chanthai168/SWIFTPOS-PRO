// src/utils/productFormData.ts
import type { ProductFormData } from "../types/product";

export function buildProductFormData(data: ProductFormData): FormData {
  const formData = new FormData();

  // Top-level fields
  if(data.id){
    formData.append('id',String(data.id));
  }
  formData.append('name', data.name);
  formData.append('description', data.description ?? '');
  formData.append('category_id', String(data.category_id ?? ''));
  formData.append('is_active', String(data.is_active));

  // Variants — append each field individually, images separately
  data.variants.forEach((variant, index) => {
    formData.append(`variants[${index}][sku]`, variant.sku);
    formData.append(`variants[${index}][variant_name]`, variant.variant_name);
    formData.append(`variants[${index}][cost_price]`, String(variant.cost_price));
    formData.append(`variants[${index}][selling_price]`, String(variant.selling_price));
    formData.append(`variants[${index}][stock_quantity]`, String(variant.stock_quantity));

    if (variant.location) {
      formData.append(`variants[${index}][location]`, variant.location);
    }
    if (variant.low_stock_threshold !== undefined) {
      formData.append(`variants[${index}][low_stock_threshold]`, String(variant.low_stock_threshold));
    }

    //  Image appended as flat 'images' key — matches upload.array('images', 10)
    if (variant.image) {
      formData.append('images', variant.image);
      formData.append('imageIndexes', String(index)); 
    }
  });

  return formData;
}