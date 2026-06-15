import type { Request,Response,NextFunction } from "express"
import { InternalError, AppError,PageNotFoundError } from "../utils/appError.js"

export const errorHandler = (error:Error,req:Request,res:Response,next:NextFunction) => {

    const knownError = new InternalError("Internal server error");

    const appError = error instanceof AppError ? error  : knownError;

    console.log(error);

    res.status(appError.statusCode).json({
        success:false,
        path:req.path,
        message:appError.message,
    })
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new PageNotFoundError("Page not found 404!")) ;
};