import { Jwt } from "jsonwebtoken";

declare namespace NodeJS {
    interface ProcessEnv {
        DATABASE_URL: string;
        ACCESS_TOKEN_SECRET: string;
        REFRESH_TOKEN_SECRET: string;
        PORT: number;
        NODE_ENV: string;
        SPOTIFY_CLIENT_ID: string;
        SPOTIFY_CLIENT_SECRET: string;
        SPOTIFY_ACCESS_TOKEN: string;
    }
}