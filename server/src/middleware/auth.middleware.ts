import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import type { Request,Response,NextFunction } from 'express';
import pool from '../config/poolConnection.js';
import type { RowDataPacket } from 'mysql2';

import type { TokenPayload } from '../types/Apptype.js';
import { UserService } from '../services/user.service.js';

const __dirname = import.meta.dirname;
dotenv.config({
    path: `${__dirname}/../../.env`
});

// This middleware validates the JWT sent in the Authorization header
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE as string, // Your Auth0 API Identifier
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/` as string, // Your Auth0 Domain URL
  tokenSigningAlg: 'RS256'
});


export const attachUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth0Id = req.auth?.payload.sub;

    const user = await UserService.getTokenPayLoadByAuth0Id(auth0Id);

    req.user = user as TokenPayload;
    
    next(); 
  } catch (error) {
    console.error('Error attaching user:', error);
    next(error);
  }
};