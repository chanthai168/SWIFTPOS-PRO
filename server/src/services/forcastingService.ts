import { UnauthorizedError } from '../utils/appError.js'

import { UserService } from "./user.service.js";
import { ForcastingRepo } from '../repositories/forcasting.repo.js';
export class ForcastingService{
    static async getLowStockItems(auth0Id:string | undefined){
        const user = await UserService.getMe(auth0Id);
        if(!user.shop?.id || !auth0Id){
            throw new UnauthorizedError("access denied");
        }
        const results = await ForcastingRepo.getLowStockItem(user.shop?.id);
        return results;
    }
    
    static async getProductRanking(auth0Id:string | undefined){
        const user = await UserService.getMe(auth0Id);
        if(!user.shop?.id || !auth0Id){
            throw new UnauthorizedError("access denied");
        }
        const results = await ForcastingRepo.getProductRanking(user.shop?.id);
        return results;
    }
}