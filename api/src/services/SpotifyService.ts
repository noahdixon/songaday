import axios from 'axios';
import qs from 'qs';
import { PrismaClient } from '@prisma/client';
import { Entity } from '@shared/dtos/Entity';
// import dotenv from 'dotenv';
// dotenv.config();

const prisma = new PrismaClient();

export interface SpotifyTokenServiceResponse {
    success: boolean,
    code?: number,
    error?: string,
    accessToken?: AccessToken
}

// #region Access Token

interface AccessToken {
    token: string;
    expiresAt: Date
}

const accessTokenRequestData = qs.stringify({
    grant_type: "client_credentials",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET
});

// Global access token and lock
let accessToken: AccessToken | null = null;
let refreshPromise: Promise<SpotifyTokenServiceResponse> | null = null;
let isRefreshing: boolean = false;

/**
 * Gets a new Spotify access token from Spotify and updates the access token in memory and on the database
 * @returns A SpotifyServiceResponse containing the new accessToken if successful, or an error message if not successful
 */

/**
 * Gets a spotify access token.
 * First checks if the token is being updated by another call and waits on that promise if there is.
 * Else checks if there is a non expired token in memory and returns it if there is.
 * Else checks if there is a non expired token in the database, and sets this token in memory and returns it if there is.
 * Else gets a new token from Spotify and sets this token in memory and returns it.
 * @returns A SpotifyServiceResponse containing the new accessToken if successful, or an error message if not successful.
 */
const getAccessToken = async (forceFetch: boolean = false): Promise<SpotifyTokenServiceResponse> => {
    // If a refresh is in progress, wait for it to complete and return the result
    if (isRefreshing && refreshPromise) {
        console.log("Awaiting ongoing refresh.");
        return await refreshPromise;
    }

    // Check memory
    if (accessToken && accessToken.expiresAt.getTime() > Date.now() && !forceFetch) {
        return { success: true, accessToken: accessToken};
    }

    // Start a new refresh process
    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            if (!forceFetch) {
                // Check database
                console.log("Access token in memory expired or does not exist.");
                console.log("Checking database.");
                const dbTokenRecord = await prisma.spotifyToken.findUnique({ where: { id: 1 } });
                if (dbTokenRecord && dbTokenRecord.expiresAt.getTime() > Date.now()) {
                    // Set token in memory
                    accessToken = { token: dbTokenRecord.token, expiresAt: dbTokenRecord.expiresAt };
                    console.log("Access token retrieved from db and updated in memory.");
                    return { success: true, accessToken: accessToken};
                }
                console.log("Access token in db expired or does not exist.");
            }
            
            // Send request to Spotify
            console.log("Sending request for new access token to Spotify.")
            const response: any = await axios.post("https://accounts.spotify.com/api/token", accessTokenRequestData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            if (response.status === 200 && response.data.access_token) {
                console.log(response.data)
                // Set access token in memory and database
                accessToken = { 
                                token: response.data.access_token, 
                                expiresAt: new Date(Date.now() + (response.data.expires_in * 1000) - 60000) // add 1 minute buffer
                            };
                await prisma.spotifyToken.upsert({
                    where: { id: 1 },
                    update: { 
                        token: accessToken.token,
                        expiresAt: accessToken.expiresAt 
                    },
                    create: { 
                        id: 1, 
                        token: accessToken.token, 
                        expiresAt: accessToken.expiresAt 
                    }
                });
                
                console.log("Access token received from Spotify and updated in memory and db.");

                return { success: true, accessToken: accessToken! };

            } else if (response.error_description) {
                return { success: false, error: response.error_description };
            } else {
                return { success: false, error: "No error description" };
            }
        } catch (error) {
            console.error("Error fetching Spotify access token:", error);
            return { success: false, error: "Error fetching Spotify access token"};
        } finally {
            console.log("Refreshing complete.");
            isRefreshing = false;
        }
    })(); // execute immediately

    return await refreshPromise;
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
        config.headers.Authorization = `Bearer ${response.accessToken!.token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Sleeps for a given number of milliseconds.
 * @param ms - The number of milliseconds to sleep.
 * @returns A promise that resolves after the given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
            // Attempt force token refresh
            const accessTokenResult: SpotifyTokenServiceResponse = await getAccessToken(true);
            if (accessTokenResult.success) {
                // Update access token and resend request
                originalRequest.headers['Authorization'] = `Bearer ${accessTokenResult.accessToken!.token}`;

                console.log("Access Token updated. Resending request.")
                return spotifyApi(originalRequest); 
            } else {
                // Return error object if refresh failed
                return Promise.reject(error);
            }
        } else if (error.response?.status === 504 && !originalRequest._retry) {
            console.log("504 Error, trying again after 2 seconds");
            await sleep(2000);
            originalRequest._retry = true;
            return spotifyApi(originalRequest);
        } else if (error.response?.status === 429 && !originalRequest._retry) {
            // Handle 429 rate limit error
            console.log("429 Error: Rate limit exceeded.");
            const retryAfter = error.response.headers['retry-after'] || 30;
            console.log(`Waiting ${retryAfter} seconds and retrying request.`);
            await sleep(retryAfter * 1000); // Wait before retrying
            originalRequest._retry = true;
            return spotifyApi(originalRequest);
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

export const searchContent = async (query: string, entity: Entity): Promise<SpotifyServiceResponse> => {
    try {
        const entityString: string = entity === "song" ? "track" : entity;
        const params = {
            q: query,          
            type: entityString,
            market: "US",
        };

        // Send request
        const response: any = await spotifyApi.get("/search", { params });
        return { success: true, data: response.data};
    } catch (error: any) {

        if (error.response?.status === 429) {
            return { success: false, code: 429, error: "SPOTIFY_RATE_LIMITED" };
        }

        // Log any errors
        console.error("Error searching for content:", error);
        return { success: false };
    }
};

const getIdSplits = (ids: string[]): string[][] => {
    const idSplits: string[][] = [];
    for (let i = 0; i < ids.length; i += 20) {
        idSplits.push(ids.slice(i, i + 20));
    }

    return idSplits;
}

export const getContent = async (contentIds: { songIds: string[], albumIds: string[], artistIds: string[] }): Promise<SpotifyServiceResponse> => {
    try {

        const songs = [];
        const albums = [];
        const artists = [];

        // Iterate over ID arrays and split in sub arrays of 20
        const songIdSplits: string[][] = getIdSplits(contentIds.songIds);
        const albumIdSplits: string[][] = getIdSplits(contentIds.albumIds);
        const artistIdSplits: string[][] = getIdSplits(contentIds.artistIds);

        // Request each batch of 20 songs and add to songs array
        for (let i = 0; i < songIdSplits.length; i++) {
            // Join ids
            const idsParam = songIdSplits[i].join(',');

            // Get songs from spotify
            const songResponse: any = await spotifyApi.get(`/tracks?ids=${idsParam}`);
            const tempSongs = songResponse.data?.tracks;
            if (!tempSongs) {
                return { success: false, code: 500, error: "Error retrieving content:" };
            }
            songs.push(...tempSongs);
        }

        // Request each batch of 20 albums and add to albums array
        for (let i = 0; i < albumIdSplits.length; i++) {
            // Join ids
            const idsParam = albumIdSplits[i].join(',');

            // Get albums from spotify
            const albumResponse: any = await spotifyApi.get(`/albums?ids=${idsParam}`);
            const tempAlbums = albumResponse.data?.albums;
            if (!tempAlbums) {
                return { success: false, code: 500, error: "Error retrieving content:" };
            }
            albums.push(...tempAlbums);
        }

        // Request each batch of 20 artists and add to artists array
        for (let i = 0; i < artistIdSplits.length; i++) {
            // Join ids
            const idsParam = artistIdSplits[i].join(',');

            // Get artists from spotify
            const artistResponse: any = await spotifyApi.get(`/artists?ids=${idsParam}`);
            const tempArtists = artistResponse.data?.artists;
            if (!tempArtists) {
                return { success: false, code: 500, error: "Error retrieving content:" };
            }
            artists.push(...tempArtists);
        }

        // Return combined data
        return { 
            success: true, 
            data: { 
                songs, 
                albums, 
                artists 
            } 
        };

    } catch (error: any) {
        // Log any errors
        console.error("Error retrieving content:", error);

        if (error.response?.status === 429) {
            return { success: false, code: 429, error: "SPOTIFY_RATE_LIMITED" };
        }

        return { success: false, code: 500, error: "Error retrieving content:" };
    }
}