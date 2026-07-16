import { InventoryMetadata } from "../controllers/stats.controller.js";
import { Router } from "express";
import { checkJwt, attachUser } from '../middleware/auth.middleware.js';
export const statsRoutes = Router();
statsRoutes.use(checkJwt,attachUser);
statsRoutes.get('/:shopId/dashboard',InventoryMetadata.getDashbaordStats);
