import type { Request, Response, NextFunction } from 'express';
import type { OrderService } from '../services/order.service.js';
import type { TokenPayload } from '../types/Apptype.js';
import type { CreateOrderDTO } from '../types/OrderType.js';
import { BadInputError } from '../utils/appError.js';

export class OrderController {
  constructor(private orderService: OrderService) {}

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const shopId = Number(req.params.shopId);
      if (isNaN(shopId)) throw new BadInputError('Shop ID must be a number');

      const user = req.user as TokenPayload;
      const body = req.body as CreateOrderDTO;

      if (!body.payment_method) {
        throw new BadInputError('Payment method is required');
      }

      const order = await this.orderService.createOrder(shopId, user.id, body);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const shopId = Number(req.params.shopId);
      if (isNaN(shopId)) throw new BadInputError('Shop ID must be a number');

      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const offset = Number(req.query.offset) || 0;
      const sort = req.query.sort === 'ASC' ? 'ASC' : 'DESC';

      const result = await this.orderService.getOrders(shopId, limit, offset, sort);
      res.json({ success: true, data: result.orders, total: result.total });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const shopId = Number(req.params.shopId);
      if (isNaN(shopId)) throw new BadInputError('Shop ID must be a number');

      const limit = Math.min(Number(req.query.limit) || 10, 100);
      const offset = Number(req.query.offset) || 0;
      const sort = req.query.sort === 'ASC' ? 'ASC' : 'DESC';

      const result = await this.orderService.getInventoryHistory(shopId, limit, offset, sort);
      res.json({ success: true, data: result.logs, total: result.total });
    } catch (error) {
      next(error);
    }
  }

  async getSupplyHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const shopId = Number(req.params.shopId);
      if (isNaN(shopId)) throw new BadInputError('Shop ID must be a number');

      const limit = Math.min(Number(req.query.limit) || 10, 100);
      const offset = Number(req.query.offset) || 0;
      const sort = req.query.sort === 'ASC' ? 'ASC' : 'DESC';

      const result = await this.orderService.getSupplyHistory(shopId, limit, offset, sort);
      res.json({ success: true, data: result.orders, total: result.total });
    } catch (error) {
      next(error);
    }
  }
}
