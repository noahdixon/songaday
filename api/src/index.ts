import dotenv from 'dotenv';
import express from "express";
import { Request, Response, NextFunction } from 'express';
import cors from "cors";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { checkJSON } from './middlewares/jsonMiddleware';
import path from 'path';
import { authenticateToken } from './middlewares/authMiddleware';
import authRoutes from './routes/authRoutes';

const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());

// Global error-handling middleware for JSON parsing errors
app.use(checkJSON);

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../../frontend/build')));

interface Post {
    userId: number;
    message: string;
}

const posts: Post[] = [
    {
        userId: 5,
        message: 'This is a post by the person with id 5'
    },
    {
        userId: 6,
        message: 'This is a post by the person with id 6'
    },
    {
        userId: 7,
        message: 'This is a post by the person with id 7'
    },
    {
        userId: 7,
        message: 'This is yet another post by the person with id 7'
    },
];

app.use('/auth', authRoutes);

app.get('/posts', authenticateToken, (req: Request, res: Response): void => {
    res.json(posts.filter(post => post.userId === req.userId));
});

// All other routes serve React app
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

app.listen(process.env.PORT);
console.log("Listening on 5000");