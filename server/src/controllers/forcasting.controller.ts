import type { NextFunction, Request,Response } from "express";
import { ForcastingService } from "../services/forcastingService.js";
import { ResponseFormat } from "../utils/response.js";
export class ForcastingController{

    static async getLowStockItems(req:Request,res:Response,next:NextFunction){
        const auth0Id = req.user?.auth0_id;

        try{
            const results = await ForcastingService.getLowStockItems(auth0Id);
            res.json(ResponseFormat.get(results,results.length));
        }
        catch(error){
            console.log('Get low stock items error:' + error);
            next(error);
        }

    }

    static async getProductRanking(req:Request,res:Response,next:NextFunction){
        const auth0Id = req.user?.auth0_id;

        try{
            const results = await ForcastingService.getProductRanking(auth0Id);
            res.json(ResponseFormat.get(results,results.length));
        }
        catch(error){
            console.log('Get items-ranking error:' + error);
            next(error);
        }

    }
}