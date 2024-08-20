import jwt from 'jsonwebtoken';
import { Response, urlencoded } from 'express';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaClient, Token } from "@prisma/client";
import { User } from '@prisma/client';

const refreshTokenTime: number = 0.5 * 60 * 1000; // 30 seconds
const accessTokenTime: string = "1d"; // 1 day

const prisma: PrismaClient = new PrismaClient();

export interface AccessPayload {
    id: number
}

export const isAccessPayload = (obj: any): obj is AccessPayload => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number'
    );
}

export interface RefreshPayload {
    id: number
    token: string
}

const isRefreshPayload = (obj: any): obj is RefreshPayload => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.token === 'string'
    );
}

export interface AuthServiceResponse {
    success: boolean,
    code?: number,
    error?: string,
    accessToken?: string,
    refreshToken?: string
}

/**
 * Gets user from database based on their email
 * @param email User email
 * @returns the User or null if no user with that email exists
 */
const getUserFromEmail = async (email: string): Promise<User | null> => {
    return await prisma.user.findUnique({
        where: { email: email }
    });
}

/**
 * Check if phone exists in the database
 * @param phone User phone
 * @returns boolean indicating if phone exists
 */
const getUserFromPhone = async (phone: string): Promise<User | null> => {
    return await prisma.user.findUnique({
        where: { phone: phone }
    });
}

/**
 * Attempts to register new user
 * @param email User email
 * @param password User password
 * @param phone User phone number
 * @returns An AuthServiceResponse indicating registration success, an http response code,
 * and an error message if authentication failed
 */
export const registerUser = async (email: string, password: string, phone?: string): Promise<AuthServiceResponse> => {
    try {
        // Check database for user email
        if (await getUserFromEmail(email)) {
            return  { success: false, code: 401, error: "Email already exists" };
        }
        // Check database for user phone number
        if (phone && await getUserFromPhone(phone)) {
            return { success: false, code: 401, error: "Phone number already exists" };
        }

        let hashedPassword;

        try {
            // Hash password
            hashedPassword = await bcrypt.hash(password, 11);
        } catch {
            // Error if hashing fails
            return { success: false, code: 500, error: "HASHING_ERROR" };
        }

        // Register user in database
        const userData: any = {
            email: email,
            password: hashedPassword
            // lastLogin: new Date() // Initialize lastLogin with current date
        };

        if (phone) {
            userData.phone = phone;
        }

        await prisma.user.create({
            data: userData
        });

        return { success: true };
    } catch (err: any) {
        // Error if registration fails
        return { success: false, code: 500, error: err.message };
    }
}

/**
 * Generates an access token for a user
 * @param userId The user ID
 * @returns A signed access token
 */
export const generateAccessToken = (userId: number): string => {
    return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: accessTokenTime });
};

/**
 * Gets a refresh token from database based on user id
 * @param id User id
 * @returns the Token or null if no refresh token exists for that user
 */
const getTokenFromId = async (id: number): Promise<Token | null> => {
    return await prisma.token.findUnique({
        where: { userId: id }
    });
}

export const generateRefreshToken = async (userId: number): Promise<string | AuthServiceResponse> => {
    try {
        // Generate random token string
        const token = randomBytes(64).toString('hex');
        let dbToken: string;
        try {
            // Hash token string
            dbToken =  await bcrypt.hash(token, 11);
        } catch {
            // Error if hashing fails
            return { success: false, code: 500, error: "HASHING_ERROR" };
        }

        // Check if a refresh token already exists for user
        const existingToken: Token | null = await (getTokenFromId(userId));
        if (existingToken) {
            // Update existing token
            await prisma.token.update({
                where: { userId: userId },
                data: {
                    token: dbToken,
                    expiresAt: new Date(Date.now() + refreshTokenTime), // token expires in 30 seconds
                },
            });
        } else {
            // Create new token
            await prisma.token.create({
                data: {
                    userId: userId,
                    token: dbToken,
                    expiresAt: new Date(Date.now() + refreshTokenTime), // token expires in 30 seconds
                },
            });
        }
        return jwt.sign({ id: userId, token: token }, process.env.REFRESH_TOKEN_SECRET as string);
    } catch {
        // Error if db calls fail
        return { success: false, code: 500, error: "DATABASE_ERROR" };
    }
}

/**
 * Sets the refresh token as an http only secure cookie in the response
 * @param res The response
 * @param refreshToken The refresh token string
 */
export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expires in 7 days
    });
}

/**
 * Clears the refresh token cookie
 * @param res The response
 */
export const deleteRefreshTokenCookie = (res: Response) => {
    res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 0 // Cookie expires immediately
    });
}

/**
 * Authenticates a user based on their email and password
 * @param email User email
 * @param password User password
 * @returns An authServiceResponse indicating authentication success, an http response code,
 * and an error message if authentication failed
 */
export const authenticateUser = async (email: string, password: string): Promise<AuthServiceResponse> => {
    try {
        // Get user from database
        const user: User | null = await getUserFromEmail(email);

        // Error if user does not exist
        if (!user) return { success: false, code: 401, error: "Email is invalid" };

        // Check password
        let success: boolean; 
        try {
            success = await bcrypt.compare(password, user.password);
        } catch {
            // Error if hashing fails
            return { success: false, code: 500, error: "HASHING_ERROR" };
        }

        // Error if password is incorrect
        if (!success) return { success: success, code: 401, error: "Password is incorrect" };

        // Generate access token
        const accessToken: string = generateAccessToken(user.id);

        // Generate refresh token
        const refreshToken: string | AuthServiceResponse = await generateRefreshToken(user.id);
        if (typeof refreshToken !== "string") return refreshToken;

        // Update user last login
        await prisma.user.update({
            where: { id: user.id },
            data: {
                lastLogin: new Date(Date.now())
            },
        });

        return { success: success, accessToken: accessToken, refreshToken: refreshToken };
    } catch {
        // Error if db calls fail
        return { success: false, code: 500, error: "DATABASE_ERROR" };
    }
}

/**
 * Generates new access and refresh tokens based on a user refresh token
 * @param res Http response to be sent back to user containing the new tokens or an error if
 * the refresh token is expired or there are issues with hashing or database interaction
 * @param refreshToken User refresh token
 */
export const refreshTokens = (res: Response, refreshToken: string) => {

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, async (err, payload: any) => {
        
        // Send error if payload is not a refresh token payload
        if (err || !isRefreshPayload(payload)) return res.sendStatus(403);

        try {
            // Get token from db using id
            const dbRefreshToken: Token | null = await getTokenFromId(payload.id);

            // Send error if token is expired or doesnt exist on db
            if (!dbRefreshToken || dbRefreshToken.expiresAt < new Date(Date.now())) return res.status(403).json({ error: "INVALID_REFRESH_TOKEN" });

            // Compare payload token string to db token string
            let success :boolean;
            try {
                success = await bcrypt.compare(payload.token, dbRefreshToken.token);
            } catch {
                // Error if hashing fails
                return { success: false, code: 500, error: "HASHING_ERROR" };
            }
            
            // Send error if token strings do not match
            if(!success) return res.status(403).json({ error: "INVALID_REFRESH_TOKEN" });

            // Generate new access token
            const accessToken: string = generateAccessToken(payload.id);

            // Generate new refresh token
            const refreshToken: string | AuthServiceResponse = await generateRefreshToken(payload.id);
            if (typeof refreshToken !== "string") return res.status(refreshToken.code!).json({ error: refreshToken.error! });

            // Set tokens and send response
            setRefreshTokenCookie(res, refreshToken);
            return res.json({ accessToken: accessToken });
        } catch {
            // Error if db calls fail
            return { success: false, code: 500, error: "DATABASE_ERROR" };
        }
    });
}

export const deleteToken = async (res: Response, refreshToken: string) => {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, async (err, payload: any) => {
        
        // Send error if payload is not a refresh token payload
        if (err || !isRefreshPayload(payload)) return res.sendStatus(403);

        try {
            // Get token from db using id
            const dbRefreshToken: Token | null = await getTokenFromId(payload.id);

            // Send error if token doesnt exist on db
            if (!dbRefreshToken) return res.status(403).json({ error: 'Token is expired, user is already signed out.' });

            // Compare payload token string to db token string
            let success: boolean;
            try {
                success = await bcrypt.compare(payload.token, dbRefreshToken.token);
            } catch {
                // Error if hashing fails
                return { success: false, code: 500, error: "HASHING_ERROR" };
            }
            
            // Send error if token strings do not match
            if(!success) return res.status(403).json({ error: 'Token is expired, user is already signed out.' });

            // Delete token from database
            await prisma.token.delete({
                where: { userId: payload.id }
            });

            // Clear token on user brower
            deleteRefreshTokenCookie(res);

            return res.sendStatus(204);
        } catch {
            // Error if db calls fail
            return { success: false, code: 500, error: "DATABASE_ERROR" };
        }
    });
}