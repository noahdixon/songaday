import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle JSON parsing errors in requests.
 * @param {Error} err The error object, potentially a JSON parsing error.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object, used to send the error response.
 * @param {NextFunction} next The next function called if there is no error.
 * @returns {Response | void} This function won't return a value if there is no error, 
 * but will call `next()` to proceed. 
 * If there is a json syntax error it will send an error response.
 */
export const checkJSON = (err: Error, req: Request, res: Response, next: NextFunction): Response | void => {
    if (err instanceof SyntaxError) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    next();
}