import express from 'express';
import { checkJwt,attachUser } from '../middleware/auth.middleware.js';
import pool from '../config/poolConnection.js';
import type { Request,Response,NextFunction } from 'express';
import type { RowDataPacket } from 'mysql2';
import { UserService } from '../services/user.service.js';
import { BadInputError } from '../utils/appError.js';
import { ResponseFormat } from '../utils/response.js';

export class UserController {
    static async getMe(req:Request,res:Response){
        try {
            const formattedResponse = await UserService.getMe(req.auth?.payload.sub);
            res.json(formattedResponse);
        } catch (error) {
            console.log("get me error:" + error);
            res.status(500).json({ message: 'Failed to retrieve user' });
        }
    }

    static async createShop(req:Request,res:Response,next:NextFunction){
        try{
            const {name,sub} = req.body;
            if(!name.trim() || !sub){
                throw new BadInputError('Name & Sub required');
            }
            const result = await UserService.createShop(name,sub);
            res.json(ResponseFormat.update({data:result}));
        }
        catch(error){
            console.log('create Shop Error:');
            next(error);
        }

    }
}
