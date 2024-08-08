import dotenv from 'dotenv';
import express from "express";
import { Request, Response, NextFunction } from 'express';
import cors from "cors";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { checkJSON } from './middlewares/jsonMiddleware';
import { authenticateToken } from './middlewares/authMiddleware';
import authRoutes from './routes/authRoutes';


// #region Environment Setup
dotenv.config();

interface Env {
    DATABASE_URL: string;
    ACCESS_TOKEN_SECRET: jwt.Secret;
    REFRESH_TOKEN_SECRET: jwt.Secret;
}

// Runtime validation for environment variables
const getEnvVariable = (key: keyof Env): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
};

const env: Env = {
    DATABASE_URL: getEnvVariable("DATABASE_URL"),
    ACCESS_TOKEN_SECRET: getEnvVariable("ACCESS_TOKEN_SECRET"),
    REFRESH_TOKEN_SECRET: getEnvVariable("REFRESH_TOKEN_SECRET")
};
// #endregion

const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());



// Global error-handling middleware for JSON parsing errors
app.use(checkJSON);

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

app.listen(5000);
console.log("Listening on 5000");