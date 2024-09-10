import axios from 'axios';
import qs from 'qs';
import { PrismaClient } from '@prisma/client';
import { Entity } from '@shared/dtos/Entity';

const prisma = new PrismaClient();

export interface SpotifyTokenServiceResponse {
    success: boolean,
    code?: number,
    error?: string,
    accessToken?: AccessToken
}

// #region Axios
let retryAfter: Date | null = null;

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

/**
 * Sleeps for a given number of milliseconds.
 * @param ms - The number of milliseconds to sleep.
 * @returns A promise that resolves after the given number of milliseconds.
 */
const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Include access token in request headers
spotifyApi.interceptors.request.use(
    async (config: any) => {
        // Check if there is a retry after
        if (retryAfter) {
            const diffMilliseconds = retryAfter.getTime() - Date.now();
            if (diffMilliseconds > 0) {
                // Add seconds to the retryAfter
                retryAfter.setSeconds(retryAfter.getSeconds() + 1);
                // Sleep until old retryAfter is reached
                console.log(`Waiting ${diffMilliseconds/1000} seconds before sending request`)
                await sleep(diffMilliseconds);
                console.log("Sending request again.");
            } else {
                // set retryAfter to null if it is later than the current time
                console.log("Setting retryAfter to null.")
                retryAfter = null;
            }
        }

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

// Add response interceptor for handling automatic access token refresh
spotifyApi.interceptors.response.use(
    (response) => { 
        return response; 
    },
    async (error) => {
        const originalRequest = error.config;
        // Access error
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log("401 Error, Getting new access token.")
            // Handle refreshing access token and resending
            originalRequest._retry = true;
            // Attempt force token refresh
            const accessTokenResult: SpotifyTokenServiceResponse = await getAccessToken(true);
            if (accessTokenResult.success) {
                // // Update access token and resend request
                // originalRequest.headers['Authorization'] = `Bearer ${accessTokenResult.accessToken!.token}`;

                console.log("Access Token updated. Resending request.")
                return spotifyApi(originalRequest); 
            } else {
                // Return error object if refresh failed
                return Promise.reject(error);
            }

        // 429 Rate limit error
        } else if (error.response?.status === 429 && (!originalRequest._numRetries || originalRequest._numRetries < 4)) {
            console.log("429 Error: Rate limit exceeded.");

            if (!originalRequest._numRetries) {
                originalRequest._numRetries = 1;
            } else {
                originalRequest._numRetries += 1;
            }

            // Set retryAfter with increasing buffer for backoff
            // Calculate minimum milliseconds needed to wait
            console.log(`requested wait time is: ${error.response.headers['retry-after']} seconds, numRetries = ${originalRequest._numRetries}`);
            const minRetryTimeMs = Date.now() + (error.response.headers['retry-after'] || 30) * 1000;
            // Compare min retry time to current retry time and take max, then add buffer seconds for exponential backoff
            const newRetryTimeMs = Math.max(minRetryTimeMs, retryAfter ? retryAfter.getTime() : minRetryTimeMs) + ((originalRequest._numRetries-1) ** 2) * 1000;
            // Set retryAfter object to new wait time
            retryAfter = new Date(newRetryTimeMs);
            return spotifyApi(originalRequest);

        // 504 Gateway error
        } else if (error.response?.status === 504 && !originalRequest._retry) {
            console.log("504 Error, trying again after 2 seconds");
            await sleep(2000);
            originalRequest._retry = true;
            return spotifyApi(originalRequest);
        }

        // Other errors
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

export const getContent = async (contentIds: { songIds: string[], albumIds: string[], artistIds: string[], songRecIds: string[] }): Promise<SpotifyServiceResponse> => {
    try {
        const songs = [];
        const albums = [];
        const artists = [];
        const songRecs = [];

        // Iterate over ID arrays and split in sub arrays of 20
        const songIdSplits: string[][] = getIdSplits(contentIds.songIds);
        const albumIdSplits: string[][] = getIdSplits(contentIds.albumIds);
        const artistIdSplits: string[][] = getIdSplits(contentIds.artistIds);
        const songRecIdSplits: string[][] = getIdSplits(contentIds.songRecIds);

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

        // Request each batch of 20 recommended songs and add to songRecs array
        for (let i = 0; i < songRecIdSplits.length; i++) {
            // Join ids
            const idsParam = songRecIdSplits[i].join(',');

            // Get recommended songs from spotify
            const songRecResponse: any = await spotifyApi.get(`/tracks?ids=${idsParam}`);
            const tempSongRecs = songRecResponse.data?.tracks;
            if (!tempSongRecs) {
                return { success: false, code: 500, error: "Error retrieving content:" };
            }
            songRecs.push(...tempSongRecs);
        }

        // Return combined data
        return { 
            success: true, 
            data: { 
                songs, 
                albums, 
                artists,
                songRecs
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

export const getRecommendation = async (contentIds: { songIds: string[], artistIds: string[] }): Promise<SpotifyServiceResponse> => {
    try {
        if (!contentIds.songIds.length && !contentIds.artistIds.length) {
            return { success: false, code: 500, error: "Must pass at least one song or artist." };
        }

        if (contentIds.songIds.length + contentIds.artistIds.length > 5) {
            return { success: false, code: 500, error: "Too much content. Expected a maximium of 5 songs and artists combined." };
        }

        const response: any = await spotifyApi.get(`/recommendations?limit=1&market=US&seed_artists=${contentIds.artistIds.join(',')}&seed_tracks=${contentIds.songIds.join(',')}`);

        if (!response?.data?.tracks?.length) {
            return { success: false, code: 400, error: "Spotify could not find a recommendation." };
        }
        
        return { success: true, data: response.data.tracks[0]};
        
    } catch (error: any) {
        // Log any errors
        console.error("Error retrieving content:", error);

        if (error.response?.status === 429) {
            return { success: false, code: 429, error: "SPOTIFY_RATE_LIMITED" };
        }

        return { success: false, code: 500, error: "Error retrieving content:" };
    }
}