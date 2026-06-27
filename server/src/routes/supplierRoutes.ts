import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller.js';
import { SupplierService } from '../services/supplier.service.js';
import { SupplierRepository } from '../repositories/supplier.repo.js';
import pool from '../config/poolConnection.js';
import { checkJwt, attachUser } from '../middleware/auth.middleware.js';

const supplierRouter = Router();
const supplierRepo = new SupplierRepository(pool);
const supplierService = new SupplierService(supplierRepo);
const supplierController = new SupplierController(supplierService);

supplierRouter.use(checkJwt, attachUser);

supplierRouter.get('/shops/:shopId/suppliers', (req, res, next) => supplierController.getSuppliers(req, res, next));
supplierRouter.get('/shops/:shopId/suppliers/:supplierId', (req, res, next) => supplierController.getSupplierById(req, res, next));
supplierRouter.post('/shops/:shopId/suppliers', (req, res, next) => supplierController.createSupplier(req, res, next));
supplierRouter.put('/shops/:shopId/suppliers/:supplierId', (req, res, next) => supplierController.updateSupplier(req, res, next));
supplierRouter.patch('/shops/:shopId/suppliers/:supplierId/deactivate', (req, res, next) => supplierController.deactivateSupplier(req, res, next));
supplierRouter.delete('/shops/:shopId/suppliers/:supplierId', (req, res, next) => supplierController.deleteSupplier(req, res, next));

export default supplierRouter;