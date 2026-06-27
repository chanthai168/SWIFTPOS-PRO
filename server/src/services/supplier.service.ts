    import { SupplierRepository } from '../repositories/supplier.repo.js';
    import type { CreateSupplierDTO, SupplierUpdateDTO } from '../types/SupplierType.js';
    import { BadInputError, NotFoundError } from '../utils/appError.js';

    export class SupplierService {
    constructor(private supplierRepo: SupplierRepository) {}

    async getSuppliers(shopId: number, search?: string, activeOnly?: boolean) {
        return await this.supplierRepo.findByShopId(shopId, search, activeOnly);
    }

    async getSupplierById(shopId: number, supplierId: number) {
        const supplier = await this.supplierRepo.findById(shopId, supplierId);
        if (!supplier) throw new NotFoundError(`Supplier with id ${supplierId} not found`);
        return supplier;
    }

    async createSupplier(shopId: number, data: CreateSupplierDTO) {
        if (!data.name || data.name.trim().length === 0) throw new BadInputError('Supplier name is required');
        if (data.lead_time_days !== undefined && data.lead_time_days < 0) throw new BadInputError('Lead time days cannot be negative');
        const supplierId = await this.supplierRepo.create(shopId, { ...data, name: data.name.trim() });
        return { supplier_id: supplierId };
    }

    async updateSupplier(shopId: number, data: SupplierUpdateDTO) {
        if (data.name !== undefined && data.name.trim().length === 0) throw new BadInputError('Supplier name cannot be empty');
        if (data.lead_time_days !== undefined && data.lead_time_days < 0) throw new BadInputError('Lead time days cannot be negative');
        return await this.supplierRepo.update(shopId, data);
    }

    async deactivateSupplier(shopId: number, supplierId: number) {
        return await this.supplierRepo.deactivate(shopId, supplierId);
    }

    async deleteSupplier(shopId: number, supplierId: number) {
        return await this.supplierRepo.remove(shopId, supplierId);
    }
    }