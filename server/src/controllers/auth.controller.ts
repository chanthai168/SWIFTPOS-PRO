import type { Request,Response,NextFunction } from "express";
import pool from "../config/poolConnection.js";
import type { RowDataPacket } from "mysql2";
import register from "../services/register.service.js";

export class RegisterService {
    static async register(req:Request,res:Response,next:NextFunction){
        try {

            const processedUser = register(req.body,req.auth?.payload.sub);

            res.status(200).json(processedUser);
            
        } catch (error) {
            console.log('register error:' + error);
            res.status(500).json({ message: 'Failed to register user' });
        }
    }
}