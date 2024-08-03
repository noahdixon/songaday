import { Request, Response, NextFunction } from 'express';

export const checkJSON = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    next();
}