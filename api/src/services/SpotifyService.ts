import express, { Request, response, Response } from 'express';
import axios from 'axios';
import qs from 'qs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SpotifyTokenServiceResponse {
    success: boolean,
    code?: number,
    error?: string,
    accessToken?: string
}

// #region Access Token

const accessTokenRequestData = qs.stringify({
    grant_type: "client_credentials",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET
});

// Global access token 
let accessToken: string | null = null;

/**
 * Gets a new Spotify access token from Spotify and updates the access token in memory and on the database
 * @returns A SpotifyServiceResponse containing the new accessToken if successful, or an error message if not successful
 */
const getNewAccessToken = async (): Promise<SpotifyTokenServiceResponse> => {
    try {
        // Send request to Spotify
        console.log("Sending request for new access token.")
        const response: any = await axios.post("https://accounts.spotify.com/api/token", accessTokenRequestData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        if (response.status === 200 && response.data.access_token) {
            // Set access token in memory and database
            accessToken = response.data.access_token;
            await prisma.spotifyToken.upsert({
                where: { id: 1 },
                update: { token: accessToken! },
                create: { id: 1, token: accessToken! }
            });

            console.log("Access token received and updated in memory and db")

            return { success: true, accessToken: accessToken! };

        } else if (response.error_description) {
            return { success: false, error: response.error_description };
        } else {
            return { success: false, error: "No error description" };
        }
    } catch (error) {
        console.error("Error fetching Spotify access token:", error);
        return { success: false, error: "No error description"};
    }
};

/**
 * Retrieves the Spotify access token from memory, or the database, or fetches a new access token from Spotify
 * @returns 
 */
const getAccessToken = async (): Promise<SpotifyTokenServiceResponse> => {
    // Check memory
    if (accessToken) {
        return { success: true, accessToken: accessToken};
    }

    try {
        // Check database
        const dbTokenRecord = await prisma.spotifyToken.findUnique({ where: { id: 1 } });

        if (dbTokenRecord) {
            accessToken = dbTokenRecord.token;
            return { success: true, accessToken: accessToken};
        }
    } catch (error) {
        return { success: false, code: 500, error: "DATABASE_ERROR" };
    }

    // Fetch new token
    return await getNewAccessToken();
};

// Axios instance for non access token API requests
const spotifyApi = axios.create({
    baseURL: 'https://api.spotify.com/v1', // Spotify API base URL
});

// Include access token in request headers
spotifyApi.interceptors.request.use(
    async (config: any) => {
        // Get token
        const response = await getAccessToken();
        if (!response.success) {
            return Promise.reject(response);
        }
        
        // Attach access token to request header
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for handling automatic access token refresh
spotifyApi.interceptors.response.use(
    (response) => { 
        return response; 
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log("401 Error, Getting new access token.")
            // Handle refreshing access token and resending
            originalRequest._retry = true;
            // Attempt token refresh
            const accessTokenResult: SpotifyTokenServiceResponse = await getNewAccessToken();
            if (accessTokenResult.success) {
                // Update access token and resend request
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                console.log("Access Token updated. Resending request.")
                return spotifyApi(originalRequest); 
            } else {
                // Return error object if refresh failed
                return Promise.reject({error});
            }
        }

        // Handle other errors
        console.error(`Spotify request error: code ${error.code}`, error);
        return Promise.reject(error);
    }
);

// #endregion

export interface SpotifyServiceResponse {
    success: boolean,
    code?: number,
    error?: string,
    data?: any
}

export const searchContent = async (query: string, entity: string): Promise<SpotifyServiceResponse> => {
    try {
        const params = {
            q: query,          
            type: entity,
            market: 'US',
        };

        // Send request
        const response: any = await spotifyApi.get('/search', { params });
        return { success: true, data: response.data};
    } catch (error) {
        // Handle log any errors
        console.error('Error searching for content:', error);
        return { success: false };
    }
};