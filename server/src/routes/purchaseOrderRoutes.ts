    // src/routes/purchaseOrderRoutes.ts
    import { Router } from 'express';
    import { PurchaseOrderController } from '../controllers/purchaseOrder.controller.js';
    import { PurchaseOrderService } from '../services/purchaseOrder.service.js';
    import { PurchaseOrderRepository } from '../repositories/purchaseOrder.repo.js';
    import pool from '../config/poolConnection.js';
    import { checkJwt, attachUser } from '../middleware/auth.middleware.js';

    const purchaseOrderRouter = Router();

    const poRepo = new PurchaseOrderRepository(pool);
    const poService = new PurchaseOrderService(poRepo);
    const poController = new PurchaseOrderController(poService);

    purchaseOrderRouter.use(checkJwt, attachUser);

    purchaseOrderRouter.get('/shops/:shopId/purchase-orders', (req, res, next) =>
    poController.getPurchaseOrders(req, res, next)
    );

    purchaseOrderRouter.get('/shops/:shopId/purchase-orders/:poId', (req, res, next) =>
    poController.getPurchaseOrderById(req, res, next)
    );

    purchaseOrderRouter.post('/shops/:shopId/purchase-orders', (req, res, next) =>
    poController.createPurchaseOrder(req, res, next)
    );

    purchaseOrderRouter.put('/shops/:shopId/purchase-orders/:poId', (req, res, next) =>
    poController.updatePurchaseOrder(req, res, next)
    );

    purchaseOrderRouter.patch('/shops/:shopId/purchase-orders/:poId/status', (req, res, next) =>
    poController.updateStatus(req, res, next)
    );

    purchaseOrderRouter.delete('/shops/:shopId/purchase-orders/:poId', (req, res, next) =>
    poController.deletePurchaseOrder(req, res, next)
    );

    purchaseOrderRouter.get('/shops/:shopId/purchase-orders/:poId/pdf', (req, res, next) =>
    poController.downloadPdf(req, res, next)
    );
    purchaseOrderRouter.post('/shops/:shopId/purchase-orders/:poId/email', (req, res, next) =>
    poController.emailToSupplier(req, res, next)
    );

    export default purchaseOrderRouter;