
import { Router } from "express";
import { RegisterService } from "../controllers/auth.controller.js";
import { checkJwt} from "../middleware/auth.middleware.js";
import { attachUser } from "../middleware/auth.middleware.js";

export const RegisterRouter = Router();
RegisterRouter.post('/register',checkJwt,RegisterService.register);

