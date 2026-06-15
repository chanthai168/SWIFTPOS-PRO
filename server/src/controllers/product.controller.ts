// src/controllers/ProductController.ts
import type { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service.js';
import { BadInputError,UnauthorizedError } from '../utils/appError.js';
import { formatToProductDetailResponse } from '../utils/formartter.js';
import { restructureProductPayload } from '../utils/restructureProductPayload.js';
import type { ProductUpdateDTO,VariantUpdateDTO } from '../types/ProductType.js';
import { ResponseFormat } from '../utils/response.js';
import fs from 'fs/promises';
import dotenv from 'dotenv';
const __dirname = import.meta.dirname;


dotenv.config({
    path: `${__dirname}/../../.env`
});

export class ProductController {
  constructor(private productService: ProductService) {}

  // GET /api/v1/:shopId/products
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;
      const { search } = req.query;


      if(!shopId){
        throw new BadInputError('Shop id require');
      }
      const products = await this.productService.getProducts(
        parseInt(shopId as string),
        search as string
      );


      res.json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  // POST /api/v1/:shopId/products
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;
      const { name, description, category_id, is_active } = req.body;

      // Validation
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Product name is required'
        });
      }

      const result = await this.productService.createProduct(
        parseInt(shopId as string),
        {
          name: name.trim(),
          description,
          category_id,
          is_active
        }
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Product created successfully'
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  // PUT /api/v1/:shopId/products
  async updateProduct(req: Request, res: Response, next: NextFunction){
    const productUpdated:ProductUpdateDTO = req.body;
    try{
      if(!productUpdated.id){
        throw new BadInputError("Product Id must provide");
      }
      if(!productUpdated.description && !productUpdated.is_active && !productUpdated.name && !productUpdated.sku){
        throw new BadInputError("No field to update!");
      }
      const result = await this.productService.updateProduct(productUpdated);
      res.json(ResponseFormat.update(result));
    }
    catch(error){
      next(error);
    }

  }

  // GET /api/v1/:shopId/categories
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;
      const categories = await this.productService.getCategories(parseInt(shopId as string));

      res.json({
        success: true,
        data: categories,
        count: categories.length
      });
    } catch (error) {
      console.log('categories error' + error);
      next(error);
    }
  }

  // POST /api/v1/:shopId/categories
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;
      const { name, description } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }

      const result = await this.productService.createCategory(
        parseInt(shopId as string),
        {
          name: name.trim(),
          description
        }
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Category created successfully'
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  // PATCH /api/v1/:shopId/products/:productId
  async attachCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId, productId } = req.params;
      const { category_id } = req.body;

      await this.productService.attachCategoryToProduct(
        parseInt(productId as string),
        parseInt(shopId as string),
        category_id === null ? null : parseInt(category_id)
      );

      res.json({
        success: true,
        message: 'Category attached successfully'
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  // POST /api/v1/:shopId/products/:productId/variants
  async createVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId, productId } = req.params;
      
      // Check if files exist
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Image file is required'
        });
      }

      const image = Array.isArray(req.files) ? req.files[0] : req.files['image']?.[0];
      
      const { 
        sku, 
        variant_name, 
        cost_price, 
        selling_price,
        stock_quantity,
        location,
        low_stock_threshold
      } = req.body;

      // Validation
      const errors: string[] = [];
      if (!sku) errors.push('SKU is required');
      if (!variant_name) errors.push('Variant name is required');
      if (cost_price === undefined) errors.push('Cost price is required');
      if (selling_price === undefined) errors.push('Selling price is required');
      if (stock_quantity === undefined) errors.push('Stock quantity is required');

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      // For single variant creation, we'll use a simplified approach
      // The full product+variants flow is handled separately
      res.status(201).json({
        success: true,
        message: 'Variant created successfully (implementation pending)',
        data: { product_id: parseInt(productId as string) }
      });

    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  // GET /api/v1/:shopId/products/:productId/variants

  async getVariants(req: Request, res: Response, next: NextFunction){
    try{
      const {shopId,productId}= req.params;
      const rows = await this.productService.getProductVariant(productId);
      const formatted = rows.map(row=>{
        return {...row,image_url:`${process.env.BACKEND_URL}${row.image_url}`}
      })
      res.status(200).json({success:true,data:formatted});
    }
    catch(error){
      console.log("get product variant error:" + error);
      next(error);
    }
  }

  /// Patch inventory/shops/${shopId}/products/${productId}/variants
  async UpdateVariants(req: Request, res: Response, next: NextFunction){
    try{
      const { shopId, productId} = req.params;
      const variantUpdated = req.body;
      const shId = Number(shopId);
      const prId = Number(productId);
      if(isNaN(shId) || isNaN(prId)) {
        throw new BadInputError('Product ID, or Shop ID required.')
      }
      const valuesArray:VariantUpdateDTO[] = Object.values(variantUpdated);
      console.log(valuesArray);
      console.log(req.params);
      const result = await this.productService.updateVariants(shId,prId,valuesArray);
      res.json(ResponseFormat.update(result));
    }
    catch(error){
      next(error)
    }
  }

  // POST /api/v1/:shopId/products/with-variants (Complete flow)
  async createProductWithVariants(req: Request, res: Response, next: NextFunction) {
    let uploadedFiles: string[] = []; // Track all uploaded file paths

    try {
      const { id } = req.body;           // product ID for update
      const { shopId } = req.params;


      if (isNaN(Number(shopId))) {
        throw new UnauthorizedError("Shop ID is required");
      }

      if (!req.user?.id) {
        throw new UnauthorizedError("User login required!");
      }

      // Get files from Multer
      const files = req.files as Express.Multer.File[] | undefined;

      // Track file paths for cleanup if needed
      if (files?.length) {
        uploadedFiles = files.map(file => file.path);
      }

      const formatted = restructureProductPayload(Number(shopId), req.body, files as any);

      // Main business logic
      const results = await this.productService.createProductWithVariants(
        Number(shopId), 
        req.user.id, 
        id, 
        formatted
      );

      res.status(201).json({
        success: true,
        productId:results.product_id,
        message: id ? 'Variants created successfully' : 'Product&Variants created successfully',
      });

    } catch (error) {
      console.error("Create Product Error:", error);

      // clean up upload file if something goes wrong
      if (uploadedFiles.length > 0) {
        console.log(`Cleaning up ${uploadedFiles.length} uploaded files...`);
        
        for (const filePath of uploadedFiles) {
          try {
            await fs.unlink(filePath);
            console.log(`Deleted: ${filePath}`);
          } catch (deleteErr) {
            console.error(`Failed to delete file ${filePath}:`, deleteErr);
            // Don't throw here - we want to show the original error
          }
        }
      }

      next(error); // Pass error to your global error handler
    }
  }

  // GET /api/v1/:shopId/products/with-variants?filter=&order=&limit&offset=&categoryId
  async getProductWithVariants(req: Request, res: Response, next: NextFunction){

    const shop_id = Number(req.params.shopId);
    if (isNaN(shop_id)) {
      throw new BadInputError("Shop ID must be number");
    }

    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const offset = req.query.offset ? Number(req.query.offset): 0;

    let categoryId:any = Number(req.query.categoryId);
    if(isNaN(categoryId)){
      categoryId = undefined;
    }

    try{
      const rows = await this.productService.getProductWithVariants(shop_id,limit,offset,{filter:req.query.filter as string,order:req.query.order as string},categoryId);
      
      const formatted = formatToProductDetailResponse(rows as any[]);
      res.json({success:true,data:formatted});
    }
    catch(error){
      console.log('get product with variant error:' + error);
      next(error);
    }
  }
}