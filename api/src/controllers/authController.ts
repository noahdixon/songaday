import { Request, Response } from 'express';
import { AuthServiceResponse, registerUser, authenticateUser, setRefreshTokenCookie, refreshTokens, deleteToken } from '../services/authService';

export const register = async (req: Request, res: Response): Promise<Response> => {
    const email: string | undefined = req.body.email;
    const phone: string | undefined = req.body.phone;
    const password: string | undefined = req.body.password;
    
    // Check that email and password were passed
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    // Attempt to register user
    const authResponse: AuthServiceResponse = await registerUser(email, password, phone);

    if (!authResponse.success) return res.status(authResponse.code!).json({ error: authResponse.error! });
    return res.sendStatus(201);
}

export const login = async (req: Request, res: Response): Promise<Response> => {
    const email: string = req.body.email;
    const password: string = req.body.password;

    // Check that email and password were passed
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    
    // Authenticate User
    const authResponse: AuthServiceResponse = await authenticateUser(email, password);
    if (!authResponse.success) return res.status(authResponse.code!).json({ error: authResponse.error! });

    // Set refresh token as HttpOnly cookie
    setRefreshTokenCookie(res, authResponse.refreshToken!);

    return res.json({ accessToken: authResponse.accessToken });
};

export const refreshToken = (req: Request, res: Response) => {
    const refreshToken: string | undefined = req.cookies.refreshToken;

    // Check that token is provided
    if (!refreshToken) return res.status(401).json({ error: "INVALID_REFRESH_TOKEN" });

    // Attempt to generate new tokens
    refreshTokens(res, refreshToken);
};

export const logout = (req: Request, res: Response) => {
    const refreshToken: string | undefined = req.cookies.refreshToken;

    // Check that token is provided
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token is required' });

    // Remove token 
    deleteToken(res, refreshToken);
};