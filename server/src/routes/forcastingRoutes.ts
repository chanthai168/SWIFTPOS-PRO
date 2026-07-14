import { ForcastingController } from "../controllers/forcasting.controller.js";
import { Router } from "express";
import { checkJwt, attachUser } from '../middleware/auth.middleware.js';
export const forcastingRouter = Router();
forcastingRouter.use(checkJwt,attachUser);
forcastingRouter.get('/low-stock-items',ForcastingController.getLowStockItems);
forcastingRouter.get('/items-ranking',ForcastingController.getProductRanking);