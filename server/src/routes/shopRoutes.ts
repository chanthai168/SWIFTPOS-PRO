import { UserController } from "../controllers/user.controller.js";
import { Router } from "express";

export const shopRouter = Router();

shopRouter.post('/',UserController.createShop);