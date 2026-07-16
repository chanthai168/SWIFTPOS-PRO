import { InventoryMetadataRepo } from "../repositories/InventoryMetadata.repo.js"
export class InventoryMetadataService{
    static async getInventoryMetadata(shopId:number){
        return await InventoryMetadataRepo.getMetaData(shopId);
    }
    static async getDashboardStats(shopId:number){
        return await InventoryMetadataRepo.getDashboardMetadata(shopId);
    }
    
}