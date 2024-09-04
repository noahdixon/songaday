import { Request, Response, NextFunction } from 'express';

export const checkEntityBody = (req: Request, res: Response, next: NextFunction): Response | void => {
    const entity = req.body.entity;
    if (!entity) {
        return res.status(400).json({ error: "Entity is required." });
    }
    if (!["song", "album", "artist"].includes(entity)) {
        return res.status(400).json({ error: "Entity must be 'song', 'album', or 'artist'." });
    }
    next();
};

export const checkEntityQuery = (req: Request, res: Response, next: NextFunction): Response | void => {
    const entity = req.query.entity as string;
    if (!entity) {
        return res.status(400).json({ error: "Entity is required." });
    }
    if (!["song", "album", "artist"].includes(entity)) {
        return res.status(400).json({ error: "Entity must be 'song', 'album', or 'artist'." });
    }
    next();
};