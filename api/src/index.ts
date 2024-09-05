import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import { Request, Response, NextFunction } from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';
import { checkJSON } from './middlewares/JsonMiddleware';
import path from 'path';
import { authenticateToken } from './middlewares/AuthMiddleware';
import AuthRoutes from './routes/AuthRoutes';
import { searchContent } from "./controllers/SpotifyController";
import UserRoutes from './routes/UserRoutes';
import { checkEntityBody } from './middlewares/EntityMiddleware';

const app = express();
if (process.env.NODE_ENV === 'development') {
    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true
    }));
}

app.use(express.json());
app.use(cookieParser());

// Global error-handling middleware for JSON parsing errors
app.use(checkJSON);

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../../../../frontend/build')));

app.use('/auth', AuthRoutes);
app.post('/search', authenticateToken, checkEntityBody, searchContent);
app.use('/user', authenticateToken, UserRoutes);

// All other routes serve React app
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

app.listen(process.env.PORT);
console.log("Listening on " + process.env.PORT);