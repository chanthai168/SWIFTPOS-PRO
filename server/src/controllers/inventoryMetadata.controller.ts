import type { Request,Response,NextFunction } from "express";
import { BadInputError } from "../utils/appError.js";
import { InventoryMetadataService } from "../services/Inventory.service.js";
import { ResponseFormat } from "../utils/response.js";
export class InventoryMetadata{
    static async getInventoryMetadata(req: Request, res: Response, next: NextFunction){
        const {shopId} = req.params;
        const id = Number(shopId);
        if(isNaN(id)){
            return new BadInputError("Shop ID must be number");
        }

        try{
            const result = await InventoryMetadataService.getInventoryMetadata(id);
            res.send(ResponseFormat.get(result,1));
        }
        catch(error){
            next(error);
        } 
    }
}