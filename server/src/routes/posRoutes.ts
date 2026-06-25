import { Router } from 'express';
import pool from '../config/poolConnection.js';
import { checkJwt, attachUser } from '../middleware/auth.middleware.js';
import { OrderRepository } from '../repositories/order.repo.js';
import { InventoryRepository } from '../repositories/ineventory.repo.js';
import { HistoryRepository } from '../repositories/history.repo.js';
import { OrderService } from '../services/order.service.js';
import { OrderController } from '../controllers/order.controller.js';

const posRouter = Router();

const orderRepo = new OrderRepository(pool);
const inventoryRepo = new InventoryRepository(pool);
const historyRepo = new HistoryRepository(pool);
const orderService = new OrderService(pool, orderRepo, inventoryRepo, historyRepo);
const orderController = new OrderController(orderService);

posRouter.use(checkJwt, attachUser);

posRouter.post('/shops/:shopId/orders', (req, res, next) =>
  orderController.createOrder(req, res, next),
);

posRouter.get('/shops/:shopId/orders', (req, res, next) =>
  orderController.getOrders(req, res, next),
);

posRouter.get('/shops/:shopId/history/inventory', (req, res, next) =>
  orderController.getInventoryHistory(req, res, next),
);

posRouter.get('/shops/:shopId/history/supply', (req, res, next) =>
  orderController.getSupplyHistory(req, res, next),
);

export default posRouter;
