import { Request, Response, NextFunction } from 'express';
import { isAccessPayload } from '../services/authService';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required.' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, payload: any) => {
        if (err || !isAccessPayload(payload)) return res.status(403).json({ error: 'INVALID_ACCESS_TOKEN' });
        req.userId = payload.id;
        next();
    });
};