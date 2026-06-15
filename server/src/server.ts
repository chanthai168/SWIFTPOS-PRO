import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import path from 'node:path';
const __dirname = import.meta.dirname;


dotenv.config();

import type { Request,Response } from 'express';

import { errorHandler,notFoundHandler } from './middleware/errorHandler.js';
import { userRouter } from './routes/userRoutes.js';
import { RegisterRouter } from './routes/publicRoutes.js';
import { shopRouter } from './routes/shopRoutes.js';
import productRouter from './routes/productRoutes.js';
import requestLogger from './middleware/logger.js';

export const server = () => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true,                // ← required for cookies
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    app.use(requestLogger);

    app.use("/api/v1/auth",userRouter);

    app.use("/api/v1/auth",RegisterRouter);

    app.use("/api/v1/shops",shopRouter);

    app.use("/api/v1/inventory",productRouter);



    app.get("/check-health",(req:Request,res:Response)=>{
        res.status(200).json({message:"Healthy right now"});
    })

    app.use(notFoundHandler);

    app.use(errorHandler);

    return app;
} 