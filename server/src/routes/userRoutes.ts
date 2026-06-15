import { Router } from "express";
import { checkJwt} from "../middleware/auth.middleware.js";
import { UserController } from "../controllers/user.controller.js";

export const userRouter = Router();
userRouter.get('/me',checkJwt,UserController.getMe);

