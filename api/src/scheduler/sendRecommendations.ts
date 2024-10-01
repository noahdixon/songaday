import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient, Frequency } from '@prisma/client';
import { getRecommendation, SpotifyServiceResponse } from "../services/SpotifyService";
import { sendRecommendationEmail } from '../services/EmailService';

const prisma = new PrismaClient();

/**
 * Determines the index into the frequency array depeneding on a provided Date
 * @param date The date
 * @returns 0 if only users with daily frequency should get a recommendation, 
 * 1 if users with daily or thrice weekly frequency should get a recommendation,
 * 2 if users with daily, thrice weekly, or weekly frequency should get a recommendation,
 * 3 if users with daily, thrice weekly, weekly, and twice monthly frequency should get a recommendation,
 * 4 if all users should get a recommendations.
 */
const getFrequencyFilterIndex = (date: Date): number => {

    const day = date.getDay();
    
    // Return 1 if day is Monday or Wednesday
    if (day === 1 || day === 3) {
        return 1;
    }

    // Return 0 if it's not Monday, Wednesday, or Friday
    if (day !== 5) {
        return 0;
    }

    // Calculate week of the month
    const week = Math.ceil(date.getDate() / 7);

    // Return 4 if it's the first Friday of the month
    if (week === 1) {
        return 4;
    }

    // Return 3 if it's the third Friday of the month
    if (week === 3) {
        return 3;
    }

    // Return 2 if it's Friday but not the first or third of the month
    return 2;
}

/**
 * Contains arrays of frequencies to be served depending on todays date
 */
const frequencyFilters: Frequency[][] = [
    [Frequency.DAILY],
    [Frequency.DAILY, Frequency.THRICE_WEEKLY],
    [Frequency.DAILY, Frequency.THRICE_WEEKLY, Frequency.WEEKLY],
    [Frequency.DAILY, Frequency.THRICE_WEEKLY, Frequency.WEEKLY, Frequency.BIWEEKLY]
];

/**
 * Gets recommendations for appropriate users today, sets them in the database, and notifies users via email/SMS
 */
const getRecommendations = async () => {
    try {
        // Get frequency filter for todays date
        const frequencyFilterIndex: number = getFrequencyFilterIndex(new Date());
        const frequencyFilter = frequencyFilters[frequencyFilterIndex] || [];

        // Generate where clause based on filter
        const whereClause = frequencyFilter.length > 0 ? {
            frequency: {
                in: frequencyFilter,
            }
        } : {};

        // Get Users
        let users = await prisma.user.findMany({
            where: whereClause,
            select: { 
                id: true,
                email: true,
                phone: true,
                songLikes: {
                    select: {
                        songId: true
                    },
                },
                albumLikes: {
                    select: {
                        albumId: true
                    },
                },
                artistLikes: {
                    select: {
                        artistId: true
                    },
                },
                sendEmails: true,
                sendTexts: true
            },
        });

        // Filter out users with no likes
        users = users.filter(user => 
            user.songLikes.length > 0 || 
            user.albumLikes.length > 0 || 
            user.artistLikes.length > 0
        );

        // Get recommendation for each user
        for (let i = 0; i < users.length; i++) {

            // Get user
            const user = users[i];

            // Select 5 random seeds from user liked content:
            const combinedLikes = [...user.songLikes, ...user.albumLikes, ...user.artistLikes];
            const selectedLikes = combinedLikes.sort(() => 0.5 - Math.random()).slice(0,5);

            // Organize seeds into id arrays:
      
            const songIds = selectedLikes.filter((item: any) => item.songId).map((item: any) => item.songId);
            const albumIds = selectedLikes.filter((item: any) => item.albumId).map((item: any) => item.albumId);
            const artistIds = selectedLikes.filter((item: any) => item.artistId).map((item: any) => item.artistId);

            // Get recommendation, attempt maximum 10 tries
            let recResponse: SpotifyServiceResponse = { success: false };
            let newSongRecommended: boolean = false;
            let song;
            for (let i = 0; i < 10; i++) {
                recResponse = await getRecommendation({ songIds, albumIds, artistIds });
                if (!recResponse.success || !recResponse.data?.id) {
                    break;
                }
                song = recResponse.data;
                
                // Check if song rec already exists or if song is in likes
                const existingRec = await prisma.songRec.findUnique({
                    where: {
                        userId_songId: {
                            userId: user.id,
                            songId: song.id
                        }
                    }
                });
                const existingSong = await prisma.songLike.findUnique({
                    where: {
                        userId_songId: {
                            userId: user.id,
                            songId: song.id
                        }
                    }
                });

                // Retry loop if song already exists
                if (existingRec || existingSong) {
                    continue;
                }

                // Set recommendation in database
                await prisma.songRec.create({
                    data: {
                        userId: user.id,
                        songId: song.id
                    },
                });

                newSongRecommended = true;
                break;
            }

            if (!recResponse.success) {
                console.log(`Error getting recommendation: ${recResponse.error}`);
                console.log("Moving to next user.");
                continue;
            }

            if (!newSongRecommended) {
                console.log(`Error getting recommendation: No new recommendations could be generated.`);
                console.log("Moving to next user.");
                continue;
            }

            // Get song title and artists
            const title: string = song.name || "No Title";
            const artist: string = song.artists
            ? song.artists.map((artist: any) => artist.name ? artist.name : "No Name").join(', ')
            : "No Artist";
            const link: string = song.external_urls?.spotify || "https://open.spotify.com/";

            // Send email
            if (user.sendEmails && user.email) {
                await sendRecommendationEmail(
                    user.email, 
                    title, 
                    artist, 
                    link
                );
            }
        }

    } catch (error: any) {
        // Log any errors
        console.error("Error getting recommendations:", error);
    }
}

/**
 * Deletes all recommendations from the database that are more than 31 days old.
 */
const removeOldRecommendations = async () => {
    try {
        // Get date that was 31 days ago
        const thirtyDaysAgo: Date = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 31);

        // Delete records SongRec table where date is older than 31 days
        await prisma.songRec.deleteMany({
            where: {
                date: {
                    lt: thirtyDaysAgo, // Less than 30 days ago
                },
            },
        });

    } catch (error: any) {
        // Log any errors
        console.error("Error getting recommendations:", error);
    }
}

/**
 * Main method that calls get recommendations and remove old recommendations
 */
const main = async () => {
    await getRecommendations();
    console.log("All new recommendations sent");
    await removeOldRecommendations();
    console.log("All old recommendations removed");
}

main();