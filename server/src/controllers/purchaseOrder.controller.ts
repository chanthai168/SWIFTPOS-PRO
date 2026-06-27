    // src/controllers/purchaseOrder.controller.ts
    import type { Request, Response, NextFunction } from 'express';
    import { PurchaseOrderService } from '../services/purchaseOrder.service.js';
    import { BadInputError } from '../utils/appError.js';
    import type { POStatus } from '../types/PurchaseOrderType.js';
    import { generatePOPdf } from '../utils/generatePOPdf.js';
    import { sendPOEmail } from '../services/emailService.js';
    export class PurchaseOrderController {
    constructor(private poService: PurchaseOrderService) {}

    async getPurchaseOrders(req: Request, res: Response, next: NextFunction) {
        try {
        const { shopId } = req.params;
        const { status, supplierId } = req.query;
        if (!shopId) throw new BadInputError('Shop id required');

        const orders = await this.poService.getPurchaseOrders(
            parseInt(shopId as string),
            status as string,
            supplierId ? parseInt(supplierId as string) : undefined
        );

        res.json({ success: true, data: orders, count: orders.length });
        } catch (error) {
        console.log(error);
        next(error);
        }
    }

    async getPurchaseOrderById(req: Request, res: Response, next: NextFunction) {
        try {
        const { shopId, poId } = req.params;
        if (!shopId || !poId) throw new BadInputError('Shop id and purchase order id required');

        const po = await this.poService.getPurchaseOrderById(
            parseInt(shopId as string),
            parseInt(poId as string)
        );

        res.json({ success: true, data: po });
        } catch (error) {
        console.log(error);
        next(error);
        }
    }

    async createPurchaseOrder(req: Request, res: Response, next: NextFunction) {
        try {
        const { shopId } = req.params;
        const { supplier_id, order_date, expected_delivery_date, notes, items } = req.body;
        if (!shopId) throw new BadInputError('Shop id required');
        if (!req.user?.id) throw new BadInputError('Authenticated user required');

        const result = await this.poService.createPurchaseOrder(
            parseInt(shopId as string),
            req.user.id,
            { supplier_id, order_date, expected_delivery_date, notes, items }
        );

        res.status(201).json({ success: true, data: result, message: 'Purchase order created successfully' });
        } catch (error) {
        console.log(error);
        next(error);
        }
    }

    async updatePurchaseOrder(req: Request, res: Response, next: NextFunction) {
        try {
        const { shopId, poId } = req.params;
        const { supplier_id, order_date, expected_delivery_date, notes, items } = req.body;
        if (!shopId || !poId) throw new BadInputError('Shop id and purchase order id required');

        await this.poService.updatePurchaseOrder(parseInt(shopId as string), {
            id: parseInt(poId as string),
            supplier_id,
            order_date,
            expected_delivery_date,
            notes,
            items
        });

        res.json({ success: true, message: 'Purchase order updated successfully' });
        } catch (error) {
        console.log(error);
        next(error);
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
        const { shopId, poId } = req.params;
        const { status } = req.body as { status: POStatus };
        if (!shopId || !poId) throw new BadInputError('Shop id and purchase order id required');
        if (!status) throw new BadInputError('status is required');
        if (!req.user?.id) throw new BadInputError('Authenticated user required');

        await this.poService.updateStatus(
            parseInt(shopId as string),
            req.user.id,
            parseInt(poId as string),
            status
        );

        res.json({ success: true, message: `Purchase order status updated to ${status}` });
        } catch (error) {
        console.log(error);
        next(error);
        }
    }

    async deletePurchaseOrder(req: Request, res: Response, next: NextFunction) {
        try {
        const { shopId, poId } = req.params;
        if (!shopId || !poId) throw new BadInputError('Shop id and purchase order id required');

        await this.poService.deletePurchaseOrder(parseInt(shopId as string), parseInt(poId as string));

        res.json({ success: true, message: 'Purchase order deleted successfully' });
        } catch (error) {
        console.log(error);
        next(error);
        }
    }
     //pdf generation controller
     // GET /api/v1/supply-chain/shops/:shopId/purchase-orders/:poId/pdf
    async downloadPdf(req: Request, res: Response, next: NextFunction) {
        try {
        const { shopId, poId } = req.params;
        if (!shopId || !poId) throw new BadInputError('Shop id and purchase order id required');

        const po = await this.poService.getPurchaseOrderById(
            parseInt(shopId as string),
            parseInt(poId as string)
        );

        generatePOPdf(po as any, res);
        } catch (error) {
        console.log(error);
        next(error);
        }
    }

        // POST /api/v1/supply-chain/shops/:shopId/purchase-orders/:poId/email
    async emailToSupplier(req: Request, res: Response, next: NextFunction) {
        try {
        const { shopId, poId } = req.params;
        const { supplier_email } = req.body;
        if (!shopId || !poId) throw new BadInputError('Shop id and purchase order id required');
        if (!supplier_email) throw new BadInputError('supplier_email is required');

        const po = await this.poService.getPurchaseOrderById(
            parseInt(shopId as string),
            parseInt(poId as string)
        );

        await sendPOEmail(supplier_email, po.supplier_name, po as any);

        res.json({ success: true, message: `Purchase order emailed to ${supplier_email}` });
        } catch (error) {
        console.log(error);
        next(error);
        }
        }

    }

   
    