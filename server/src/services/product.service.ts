// src/services/ProductService.ts
import { ProductRepository } from '../repositories/product.repo.js';
import { CategoryRepository } from '../repositories/category.repo.js';
import { ProductVariantRepository } from '../repositories/productVariant.repo.js';
import { ProductImageRepository } from '../repositories/productImage.repo.js';
import { InventoryRepository } from '../repositories/ineventory.repo.js';
import type { Express } from 'express';
import multer from 'multer';
import type { CreateProductDTO,ProductUpdateDTO,VariantUpdateDTO } from '../types/ProductType.js';
import { BadInputError,NotFoundError } from '../utils/appError.js';


export class ProductService {
  constructor(
    private productRepo: ProductRepository,
    private categoryRepo: CategoryRepository,
    private variantRepo: ProductVariantRepository,
    private imageRepo: ProductImageRepository,
    private inventoryRepo: InventoryRepository
  ) {}

  // Step 1: Get products for picker
  async getProducts(shopId: number, search?: string) {
    return await this.productRepo.findByShopId(shopId, search);
  }

  async updateProduct(data:ProductUpdateDTO){
    return await this.productRepo.update(data);
  }

  // Step 1: Create new product
  async createProduct(shopId: number, data: {
    name: string;
    description?: string;
    category_id?: number;
    is_active?: boolean;
  }) {
    const productId = await this.productRepo.create(shopId, data);
    return { product_id: productId };
  }

  // Step 2: Get categories for picker
  async getCategories(shopId: number) {
    return await this.categoryRepo.findByShopId(shopId);
  }

  // Step 2: Create new category
  async createCategory(shopId: number, data: { name: string; description?: string }) {
    // Check if category name already exists
    const categories = await this.categoryRepo.findByShopId(shopId);
    const existing = categories.find(c => c.name.toLowerCase() === data.name.toLowerCase());
    
    if (existing) {
      throw new Error(`Category "${data.name}" already exists`);
    }

    const categoryId = await this.categoryRepo.create(shopId, data);
    return { category_id: categoryId };
  }

  async getProductVariant(productId:any){
    const num_id = Number(productId);
    if(isNaN(num_id)){
      throw new BadInputError('Product ID must be provide with appropriate type.')
    }
    return await this.variantRepo.findByProductId(num_id);
  }

  // Step 2: Attach category to product
  async attachCategoryToProduct(productId: number, shopId: number, categoryId: number | null) {
    const product = await this.productRepo.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.shop_id !== shopId) {
      throw new Error('Product does not belong to this shop');
    }

    if (categoryId) {
      const category = await this.categoryRepo.findById(categoryId, shopId);
      if (!category) {
        throw new Error('Category not found');
      }
    }

    await this.productRepo.updateCategory(productId, categoryId);
    return { success: true };
  }

  // Step 3: Create product with variants (full flow)
  async createProductWithVariants(shopId: number,userId: number,productId:number | undefined, productData:CreateProductDTO) {
    // Create base product
    if(!productId){
        productId = await this.productRepo.create(shopId, productData);
    }
 

    // Create variants
    for (const variant of productData.variants) {
      // Check SKU uniqueness
      const skuExists = await this.variantRepo.checkSkuExists(shopId, variant.sku);
      if (skuExists) {
        throw new BadInputError(`SKU ${variant.sku} already exists in this shop`);
      }

      let productImageId: number | null = null;

      // Upload image if provided
      if (variant.image) {
        productImageId = await this.imageRepo.create({
          image_url: variant.image.image_url,
          file_name: variant.image.file_name,
          file_size: variant.image.file_size,
          mimetype: variant.image.mimetype
        });
      }

      if(!productImageId ){
        throw Error("Unable to upload");
      }

      // Create variant
      const variantId = await this.variantRepo.create(shopId, {
        product_id: productId,
        product_image_id: productImageId,
        sku: variant.sku,
        variant_name: variant.variant_name,
        cost_price: variant.cost_price,
        selling_price: variant.selling_price
      });


      // Create inventory record
      await this.inventoryRepo.create({
        shop_id: shopId,
        product_variant_id: variantId,
        location: variant.inventory.location as string,
        quantity_on_hand: variant.inventory.quantity_on_hand,
        available_quantity: variant.inventory.quantity_on_hand,
        low_stock_threshold: variant.inventory.low_stock_threshold || 5
      });

      // Create inventory log
      await this.createInventoryLog(shopId, variantId, userId, 'IN', 
        `Initial stock for variant ${variant.sku}`, variant.inventory.quantity_on_hand);
    }

    return { product_id: productId };
  }

  async getProductWithVariants(
    shop_id: number,
    limit: number,
    offset: number,
    filter: {filter:string,order:string},
    category_id?: number
  ){
    if (shop_id <= 0) {
    throw new BadInputError('shop_id must be positive');
  }
  
  // Default values (business decisions)
  limit = Math.min(limit || 100, 500);
  
  // Allowed values (business rules)
  const allowedFilters = ['selling_price', 'cost_price', 'created_at', 'name'];
  if (filter.filter && !allowedFilters.includes(filter.filter)) {
    throw new BadInputError(`filter must be one of: ${allowedFilters.join(', ')}`);
  }
  filter.order = (filter.order ?? 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  
  // Relationship validation
  if (category_id) {
    const categoryExists = await this.categoryRepo.findById(category_id,shop_id);
    if (!categoryExists) {
      throw new NotFoundError('Category not found');
    }
  }
    const rows = await this.productRepo.getProductWithVariant(shop_id,limit,offset,filter,category_id);
    return rows;
  }


  async updateVariants(shopId:number,productId:number,variants:VariantUpdateDTO[]){

    const invalidVariant = variants.find(e => Number(e.damaged_quantity) > Number(e.quantity_on_hand) );
    if(invalidVariant){
      throw new BadInputError("Your input seem unintentional becuase quantity on hand lowwer than damaged quantity");
    }

    return await this.variantRepo.update(shopId,productId,variants);

  }

  private async createInventoryLog(
    shopId: number,
    variantId: number,
    userId: number,
    type: string,
    description: string,
    changeAmount: number
  ) {
    // Get inventory ID for this variant
    const [rows] = await (this as any).productRepo.pool.query(`
      SELECT id FROM inventories WHERE product_variant_id = ? AND shop_id = ?
    `, [variantId, shopId]);

    if (rows.length > 0) {
      await (this as any).productRepo.pool.query(`
        INSERT INTO inventory_logs 
        (inventory_id, shop_id, user_id, type, description, change_amount)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [rows[0].id, shopId, userId, type, description, changeAmount]);
    }
  }
}