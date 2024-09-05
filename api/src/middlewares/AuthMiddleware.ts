import { Request, Response, NextFunction } from 'express';
import { isAccessPayload } from '../services/AuthService';
import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// dotenv.config();

/**
 * Middleware function to authenticate a JWT access token from the request header and extract the userId to the request.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next function called if the token is valid.
 * @returns {Response | void} - This function won't return a value if the request is authenticated, 
 * but will call `next()` to proceed. 
 * If the request is not authenticated it will send an error response.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): Response | void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required.' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, payload: any) => {
        if (err || !isAccessPayload(payload)) return res.status(403).json({ error: 'INVALID_ACCESS_TOKEN' });
        req.userId = payload.id;
        next();
    });
};