
import { TokenPayload } from "./Apptype.ts";

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload | undefined;
        }
    }
}