    import type { Request, Response, NextFunction } from 'express';
    import { SupplierService } from '../services/supplier.service.js';
    import { BadInputError } from '../utils/appError.js';

    export class SupplierController {
    constructor(private supplierService: SupplierService) {}

    async getSuppliers(req: Request, res: Response, next: NextFunction) {
        try {
        const { shopId } = req.params;
        const { search, activeOnly } = req.query;
        if (!shopId) throw new BadInputError('Shop id required');
        const suppliers = await this.supplierService.getSuppliers(
            parseInt(shopId as string), search as string, activeOnly === 'true'
        );
        res.json({ success: true, data: suppliers, count: suppliers.length });
        } catch (error) { console.log(error); next(error); }
    }

    async getSupplierById(req: Request, res: Response, next: NextFunction) {
        try {
        const { shopId, supplierId } = req.params;
        if (!shopId || !supplierId) throw new BadInputError('Shop id and supplier id required');
        const supplier = await this.supplierService.getSupplierById(parseInt(shopId as string), parseInt(supplierId as string));
        res.json({ success: true, data: supplier });
        } catch (error) { console.log(error); next(error); }
    }

    async createSupplier(req: Request, res: Response, next: NextFunction) {
        try {
        const { shopId } = req.params;
        const { name, contact_person, phone, email, address, lead_time_days, is_active } = req.body;
        if (!shopId) throw new BadInputError('Shop id required');
        const result = await this.supplierService.createSupplier(parseInt(shopId as string), {
            name, contact_person, phone, email, address, lead_time_days, is_active
        });
        res.status(201).json({ success: true, data: result, message: 'Supplier created successfully' });
        } catch (error) { console.log(error); next(error); }
    }

    async updateSupplier(req: Request, res: Response, next: NextFunction) {
        try {
        const { shopId, supplierId } = req.params;
        const { name, contact_person, phone, email, address, lead_time_days, is_active } = req.body;
        if (!shopId || !supplierId) throw new BadInputError('Shop id and supplier id required');
        const result = await this.supplierService.updateSupplier(parseInt(shopId as string), {
            id: parseInt(supplierId as string), name, contact_person, phone, email, address, lead_time_days, is_active
        });
        res.json({ success: true, data: result, message: 'Supplier updated successfully' });
        } catch (error) { console.log(error); next(error); }
    }

    async deactivateSupplier(req: Request, res: Response, next: NextFunction) {
        try {
        const { shopId, supplierId } = req.params;
        if (!shopId || !supplierId) throw new BadInputError('Shop id and supplier id required');
        await this.supplierService.deactivateSupplier(parseInt(shopId as string), parseInt(supplierId as string));
        res.json({ success: true, message: 'Supplier deactivated successfully' });
        } catch (error) { console.log(error); next(error); }
    }

    async deleteSupplier(req: Request, res: Response, next: NextFunction) {
        try {
        const { shopId, supplierId } = req.params;
        if (!shopId || !supplierId) throw new BadInputError('Shop id and supplier id required');
        await this.supplierService.deleteSupplier(parseInt(shopId as string), parseInt(supplierId as string));
        res.json({ success: true, message: 'Supplier deleted successfully' });
        } catch (error) { console.log(error); next(error); }
    }
    }