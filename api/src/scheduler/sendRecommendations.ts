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
            // user.albumLikes.length > 0 || 
            user.artistLikes.length > 0
        );

        // Get recommendation for each user
        for (let i = 0; i < users.length; i++) {

            // Get user
            const user = users[i];

            // Determine seed numbers
            let numSongSeeds = 3;
            let numArtistSeeds = 2;
            if (user.songLikes.length < 3) {
                numSongSeeds = user.songLikes.length;
                numArtistSeeds = 5 - numSongSeeds;
            } else if (user.artistLikes.length < 2) {
                numArtistSeeds = user.artistLikes.length;
                numSongSeeds = 5 - numArtistSeeds;
            }

            // Get numSongSeeds random songs from their likes
            const shuffledSongs = user.songLikes.sort(() => 0.5 - Math.random());
            const selectedSongs = shuffledSongs.slice(0, numSongSeeds);
            const selectedSongIds = selectedSongs.map((song) => song.songId);

            // Get numArtistSeeds random artists from their likes
            const shuffledArtists = user.artistLikes.sort(() => 0.5 - Math.random());
            const selectedArtists = shuffledArtists.slice(0, numArtistSeeds);
            const selectedArtistIds = selectedArtists.map((artist) => artist.artistId);

            // Get recommendation
            // Attempt maximum 10 tries
            let recResponse: SpotifyServiceResponse = { success: false };
            let newSongRecommended: boolean = false;
            let song;
            for (let i = 0; i < 10; i++) {
                recResponse = await getRecommendation({
                    songIds: selectedSongIds,
                    artistIds: selectedArtistIds
                });
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

            // Send text
            if (user.sendTexts) {
                
            }
        }

    } catch (error: any) {
        // Log any errors
        console.error("Error getting recommendations:", error);
    }
}

/**
 * Deletes all recommendations from the database that are older that 31 days old.
 */
const removeOldRecommendations = async () => {
    try {
        // Get date that was 31 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 31);

        // Delete records SongRec table where date is older than 31 days
        const deleted = await prisma.songRec.deleteMany({
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