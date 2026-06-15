import pool from "../config/poolConnection.js";
import type { RowDataPacket } from "mysql2";
import { BadInputError, UnauthorizedError,UnRegisterError } from "../utils/appError.js";
import { UserRepo } from "../repositories/user.repo.js";
import { NotFoundError } from "../utils/appError.js";

export class UserService{
    static async getUserByAuth0Id(auth0Id:any){
        if (!auth0Id) {
            throw new UnauthorizedError("Unauthorized: No token payload found");
        }
        const user = await UserRepo.findByAuth0Id(auth0Id);

        if (!user) {
            throw new UnRegisterError('User authenticated with Auth0 but not registered in local database')
        }
        return user;
    }

    static async getMe(auth0Id:any){
        if(!auth0Id){
            throw new UnauthorizedError("Login required");
        }

        const userData = await UserRepo.getMe(auth0Id);

        if(!userData){
            throw new NotFoundError('User not found!');
        }

        const formattedResponse = {
            user: {
                id: userData.id,
                role:userData.role,
                email: userData.email,
                name: userData.name,
                picture: userData.profile_picture_url
            },
            shop: userData.shop_id ? {
                id: userData.shop_id,
                name: userData.shop_name
            } : null 
        };

        return formattedResponse;
    }

    static async getTokenPayLoadByAuth0Id(auth0Id:any){
        if (!auth0Id) {
            throw new UnauthorizedError("Unauthorized: No token payload found");
        }
        const user = await UserRepo.getTokenPayloadByAuth0Id(auth0Id);

        if (!user) {
            throw new UnRegisterError('User authenticated with Auth0 but not registered in local database')
        }
        return user;
    }

    static async createShop(name:string,sub:string){
        const user = await UserRepo.findByAuth0Id(sub);
        if(!user){
            throw new UnauthorizedError("Unauthorized");
        }

        const existingShop = await UserRepo.findShopByUserId(user.id);
        if(existingShop){
            throw new BadInputError('You can only create one shop');
        }

        const resultUser = await UserRepo.createShop(name,user.id,sub);
        if(!resultUser){
            throw Error('Failed to create shop');
        }
        return resultUser;
    }
}