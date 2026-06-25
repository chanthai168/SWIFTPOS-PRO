// src/services/productService.ts
import api from './api';
import type { ProductUpdateDTO } from '../types/product';

export const productService = {
  // Step 1: Products
  getProducts: async (shopId: number, search?: string) => {
    const params = search ? { search } : {};
    const response = await api.get(`/inventory/shops/${shopId}/products`, { params });
    return response.data;
  },
  createProduct: async (shopId: number, data: {
    name: string;
    description?: string;
    category_id?: number;
    is_active?: boolean;
  }) => {
    const response = await api.post(`/inventory/shops/${shopId}/products`, data);
    return response.data;
  },
  updateProduct: async (shopId:number,data:ProductUpdateDTO)=>{
    const response = await api.put(`/inventory/shops/${shopId}/products`, data);
    return response.data;
  },

  // Step 2: Categories
  getCategories: async (shopId: number) => {
    const response = await api.get(`/inventory/shops/${shopId}/categories`);
    return response.data;
  },

  createCategory: async (shopId: number, data: { name: string; description?: string }) => {
    const response = await api.post(`/inventory/shops/${shopId}/categories`, data);
    return response.data;
  },

  getVariants: async (shopId: number,productId:number) => {
    const response = await api.get(`/inventory/shops/${shopId}/products/${productId}/variants`);
    return response.data;
  },

  updateVariants: async (shopId: number,productId:number,data:any) => {
    const response = await api.patch(`/inventory/shops/${shopId}/products/${productId}/variants`,data);
    return response.data;
  },

  attachCategoryToProduct: async (shopId: number, productId: number, categoryId: number | null) => {
    const response = await api.patch(`/inventory/shops/${shopId}/products/${productId}`, { category_id: categoryId });
    return response.data;
  },

  // Step 3: Complete flow with variants
  createProductWithVariants: async (shopId: number, formData: any) => {
    const response = await api.post(`/inventory/shops/${shopId}/products/with-variants`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getProductWithVariants: async (shopId:number,filter:string = 'cost_price',order:string = 'DESC',limit:number = 30,offset:number = 0,categoryId?:number) => {
    let url = `inventory/shops/${shopId}/products/with-variants?filter=${filter}&order=${order}&limit=${limit}&offset=${offset}`
    if(categoryId){
      url = url + `&categoryId=${categoryId} `;
    }
    const response = await api.get(url);
    return response.data;
  },
  getInventoryMetadata: async (shopId:number) => {
    let url = `inventory/shops/${shopId}/metadatas`
    const response = await api.get(url);
    return response.data ;
  }
};