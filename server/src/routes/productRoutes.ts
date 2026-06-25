// src/routes/productRoutes.ts
import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { ProductService } from '../services/product.service.js';
import { ProductRepository } from '../repositories/product.repo.js';
import { CategoryRepository } from '../repositories/category.repo.js';
import { ProductVariantRepository } from '../repositories/productVariant.repo.js';
import { ProductImageRepository } from '../repositories/productImage.repo.js';
import { InventoryRepository } from '../repositories/ineventory.repo.js';
import pool from '../config/poolConnection.js';
import multer from 'multer';
import { checkJwt } from '../middleware/auth.middleware.js';
import type { TokenPayload } from '../types/Apptype.js';
import path from 'node:path';
import fs from 'fs';
import { attachUser } from '../middleware/auth.middleware.js';

const productRouter = Router();


// Initialize repositories
const productRepo = new ProductRepository(pool);
const categoryRepo = new CategoryRepository(pool);
const variantRepo = new ProductVariantRepository(pool);
const imageRepo = new ProductImageRepository(pool);
const inventoryRepo = new InventoryRepository(pool);

// Initialize service
const productService = new ProductService(
  productRepo,
  categoryRepo,
  variantRepo,
  imageRepo,
  inventoryRepo
);

// Initialize controller
const productController = new ProductController(productService);

const userImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const user = req.user as TokenPayload | undefined;

    if (!user?.id) {
      return cb(new Error('User not authenticated'), '');
    }

    const userFolder = path.join('uploads', 'users', `user_${user.id}`, 'photos');

    // Create folder if it doesn't exist
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    cb(null, userFolder);
  },

  filename: (req, file, cb) => {
    const user = req.user as TokenPayload | undefined;

    if (!user?.id) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `unknown-${uniqueSuffix}${path.extname(file.originalname)}`);
      return;
    }

    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();

    // Clean filename: profile-1742893456789.jpg
    const filename = `photo-${timestamp}${ext}`;

    cb(null, filename);
  }
});

const imageFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValidMime = allowedTypes.test(file.mimetype);
  const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (isValidMime && isValidExt) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WEBP) are allowed'));
  }
};

const upload = multer({
  storage: userImageStorage,        // ← Replaced with user-specific storage
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFileFilter
});


// Apply auth middleware to all routes
productRouter.use(checkJwt,attachUser);

// Step 1: Product endpoints
productRouter.get('/shops/:shopId/products', (req, res, next) => 
  productController.getProducts(req, res, next)
);

productRouter.post('/shops/:shopId/products', (req, res, next) => 
  productController.createProduct(req, res, next)
);

productRouter.put('/shops/:shopId/products', (req, res, next) => 
  productController.updateProduct(req, res, next)
);

// Step 2: Category endpoints
productRouter.get('/shops/:shopId/categories', (req, res, next) => 
  productController.getCategories(req, res, next)
);

productRouter.post('/shops/:shopId/categories', (req, res, next) => 
  productController.createCategory(req, res, next)
);

productRouter.get('/shops/:shopId/products/:productId/variants',(req,res,next)=>
  productController.getVariants(req,res,next)
);

productRouter.get('/shops/:shopId/products/with-variants',(req,res,next)=>
  productController.getProductWithVariants(req,res,next)
);

productRouter.patch('/shops/:shopId/products/:productId', (req, res, next) => 
  productController.attachCategory(req, res, next)
);

productRouter.patch('/shops/:shopId/products/:productId/variants', (req, res, next) => 
  productController.UpdateVariants(req, res, next)
);

// Step 3: Variant endpoints (single variant)
productRouter.post(
  '/shops/:shopId/products/:productId/variants',
  upload.single('image'),
  (req, res, next) => productController.createVariant(req, res, next)
);

// Complete flow: Product with multiple variants
productRouter.post(
  '/shops/:shopId/products/with-variants',
  upload.array('images', 10), // Allow up to 10 images
  (req, res, next) => productController.createProductWithVariants(req, res, next)
);

export default productRouter;