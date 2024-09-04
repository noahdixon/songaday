import dotenv from 'dotenv';
dotenv.config();
import { Prisma, PrismaClient, Frequency } from '@prisma/client';
import crypto from 'crypto'; 
import { Entity } from '@shared/dtos/Entity';

const prisma = new PrismaClient();

export interface UserDataServiceResponse {
    success: boolean,
    code?: number,
    error?: string,
    data?: any
}

export const likeContent = async (userId: number, contentId: string, entity: Entity): Promise<UserDataServiceResponse> => {
    try {
        // Confirm user exists
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return {
                success: false,
                code: 404,
                error: "User does not exist."
            };
        }

        // Attempt like content
        switch(entity) {
            case "song":
                await prisma.songLike.create({
                    data: { userId, songId: contentId }
                });
                break;
            case "album":
                await prisma.albumLike.create({
                    data: { userId, albumId: contentId }
                });
                break;
            case "artist":
                await prisma.artistLike.create({
                    data: { userId, artistId: contentId }
                });
                break;
            default:
                return {
                    success: false,
                    code: 400,
                    error: "Entity must be 'song', 'album', or 'artist'."
                };
        }
        return { success: true };
        
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Check if error is due to unique constraint violation
            if (error.code === "P2002") {
                return {
                    success: false,
                    code: 409,  // Conflict status code
                    error: "User has already liked this content."
                };
            }
        }

        // Generic error response
        return {
            success: false,
            code: 500,
            error: "An unexpected error occurred."
        };
    }
};

export const removeContent = async (userId: number, contentId: string, entity: Entity): Promise<UserDataServiceResponse> => {
    try {
        // Confirm user exists
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return {
                success: false,
                code: 404,  // Not Found status code
                error: "User does not exist."
            };
        }
        
        // Attempt remove content
        let deleteResult;
        switch(entity) {
            case "song":
                deleteResult = await prisma.songLike.deleteMany({
                    where: { userId, songId: contentId }
                });
                break;
            case "album":
                deleteResult = await prisma.albumLike.deleteMany({
                    where: { userId, albumId: contentId }
                });
                break;
            case "artist":
                deleteResult = await prisma.artistLike.deleteMany({
                    where: { userId, artistId: contentId }
                });
                break;
            default:
                return {
                    success: false,
                    code: 400,
                    error: "Entity must be 'song', 'album', or 'artist'."
                };
        }

        if (deleteResult.count === 0) {
            // No rows affected means there was no like to delete
            return {
                success: false,
                code: 404,
                error: "User does not already like this content."
            };
        }

        return { success: true };
        
    } catch (error: any) {
        // Generic error response
        return {
            success: false,
            code: 500,
            error: "An unexpected error occurred."
        };
    }
};

export const getContent = async (userId: number): Promise<UserDataServiceResponse> => {
    try {
        // Confirm user exists
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return {
                success: false,
                code: 404,
                error: "User does not exist."
            };
        }

        // Get liked song IDs
        const likedSongs = await prisma.songLike.findMany({
            where: { userId },
            select: { songId: true },
        });

        // Get liked album IDs
        const likedAlbums = await prisma.albumLike.findMany({
            where: { userId },
            select: { albumId: true },
        });

        // Get liked artist IDs
        const likedArtists = await prisma.artistLike.findMany({
            where: { userId },
            select: { artistId: true },
        });

        // Extract IDs from results
        const songIds = likedSongs.map(item => item.songId);
        const albumIds = likedAlbums.map(item => item.albumId);
        const artistIds = likedArtists.map(item => item.artistId);

        // Return data
        return {
            success: true,
            data: {
                songIds,
                albumIds,
                artistIds
            }
        };
        
    } catch (error: any) {
        console.error(error);
        // Generic error response
        return { success: false, code: 500, error: "DATABASE_ERROR" };
    }
};

export const getDeliverySettings = async (userId: number): Promise<UserDataServiceResponse> => {
    try {
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true,
                      phone: true,
                      sendEmails: true, 
                      sendTexts: true, 
                      frequency: true }
        });

        // Check user exists
        if (!user) {
            return {
                success: false,
                code: 404,
                error: "User does not exist."
            };
        }
        
        // Return data
        return {
            success: true,
            data: {
                email: user.email,
                phone: user.phone,
                sendEmails: user.sendEmails,
                sendTexts: user.sendTexts,
                frequency: user.frequency
            }
        };
        
    } catch (error: any) {
        console.error(error);
        // Generic error response
        return { success: false, code: 500, error: "DATABASE_ERROR" };
    }
};

export const updateDeliverySetting = async (userId: number, setting: string, value: string | boolean): Promise<UserDataServiceResponse> => {
    try {
        let updateData: any = {};

        switch (setting) {
            case "frequency":
                if (!["DAILY", "THRICE_WEEKLY", "WEEKLY", "BIWEEKLY", "MONTHLY"].includes(value as string)) {
                    return {
                        success: false,
                        code: 422,
                        error: "Invalid frequency value."
                    };
                }
                updateData.frequency = value as Frequency;
                break;

            case "sendEmails":
                if (typeof value !== "boolean") {
                    return {
                        success: false,
                        code: 422,
                        error: "Invalid value for sendEmails. Must be a boolean."
                    };
                }
                updateData.sendEmails = value as boolean;
                break;

            case "sendTexts":
                if (typeof value !== "boolean") {
                    return {
                        success: false,
                        code: 422,
                        error: "Invalid value for sendTexts. Must be a boolean."
                    };
                }
                updateData.sendTexts = value as boolean;
                break;

            default:
                return {
                    success: false,
                    code: 422,
                    error: "Invalid setting parameter."
                };
        }

        // Update setting
        await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        return { success: true };

    } catch (error: any) {
        console.error(error);
        // Generic error response
        return { success: false, code: 500, error: "DATABASE_ERROR" };
    }
};