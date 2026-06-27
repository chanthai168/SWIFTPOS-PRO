    // src/services/purchaseOrder.service.ts
    import { PurchaseOrderRepository } from '../repositories/purchaseOrder.repo.js';
    import type {
    CreatePurchaseOrderDTO,
    UpdatePurchaseOrderDTO,
    POStatus
    } from '../types/PurchaseOrderType.js';
    import { BadInputError } from '../utils/appError.js';

    export class PurchaseOrderService {
    constructor(private poRepo: PurchaseOrderRepository) {}

    async getPurchaseOrders(shopId: number, status?: string, supplierId?: number) {
        return await this.poRepo.findByShopId(shopId, status, supplierId);
    }

    async getPurchaseOrderById(shopId: number, poId: number) {
        const po = await this.poRepo.findById(shopId, poId);
        if (!po) throw new BadInputError(`Purchase order ${poId} not found`);
        return po;
    }

    private validateItems(items: CreatePurchaseOrderDTO['items']) {
        if (!items || items.length === 0) {
        throw new BadInputError('Purchase order must have at least one item');
        }
        for (const item of items) {
        if (!item.product_variant_id) throw new BadInputError('Each item requires a product_variant_id');
        if (!item.quantity || item.quantity <= 0) throw new BadInputError('Item quantity must be greater than 0');
        if (item.unit_cost === undefined || item.unit_cost < 0) throw new BadInputError('Item unit cost cannot be negative');
        }
    }

    async createPurchaseOrder(shopId: number, userId: number, data: CreatePurchaseOrderDTO) {
        if (!data.supplier_id) throw new BadInputError('supplier_id is required');
        if (!data.order_date) throw new BadInputError('order_date is required');
        this.validateItems(data.items);

        const poId = await this.poRepo.create(shopId, userId, data);
        return { purchase_order_id: poId };
    }

    async updatePurchaseOrder(shopId: number, data: UpdatePurchaseOrderDTO) {
        if (data.items) this.validateItems(data.items);
        return await this.poRepo.update(shopId, data);
    }

    async updateStatus(shopId: number, userId: number, poId: number, status: POStatus) {
        return await this.poRepo.updateStatus(shopId, userId, poId, status);
    }

    async deletePurchaseOrder(shopId: number, poId: number) {
        return await this.poRepo.remove(shopId, poId);
        
    }
    
    
    
    }