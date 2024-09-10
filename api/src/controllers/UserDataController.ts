import { Request, Response } from 'express';
import { Entity } from '@shared/dtos/Entity';
import { UserDataServiceResponse, 
        likeContent as userLikeContent,
        removeContent as userRemoveContent,
        getContent as userGetContent,
        getDeliverySettings as userGetDeliverySettings,
        updateDeliverySetting as userUpdateDeliverySetting} from '../services/UserDataService';
import { SpotifyServiceResponse, getContent as spotifyGetContent } from '../services/SpotifyService';
import { mapAlbum, mapArtist, mapSong } from './SpotifyController';
import { Song } from '@shared/dtos/Song';
import { Artist } from '@shared/dtos/Artist';
import { Album } from '@shared/dtos/Album';

export const likeContent = async (req: Request, res: Response): Promise<Response> => {
    const userId: number = req.userId as number;
    const contentId: string = req.body.contentId as string;
    const entity: Entity = req.body.entity;
    
    // Check that arguments were passed correctly
    if (!userId) {
        return res.status(401).json({ error: "User not authenticated." });
    }
    if (!contentId) {
        return res.status(422).json({ error: "Content id string is required." });
    }

    // Like content
    const result: UserDataServiceResponse = await userLikeContent(userId, contentId, entity);
    if (!result.success) {
        return res.status(result.code!).json({ error: result.error! });
    }

    // Return success
    return res.sendStatus(201);
};

export const removeContent = async (req: Request, res: Response): Promise<Response> => {
    const userId: number = req.userId as number;
    const contentId: string = req.query.contentId as string;
    const entity: Entity = req.query.entity as Entity;
    
    // Check that arguments were passed correctly
    if (!userId) {
        return res.status(401).json({ error: "User not authenticated." });
    }
    if (!contentId) {
        return res.status(422).json({ error: "Content id string is required." });
    }

    // Remove content
    const result: UserDataServiceResponse = await userRemoveContent(userId, contentId, entity);
    if (!result.success) {
        return res.status(result.code!).json({ error: result.error! });
    }

    // Return success
    return res.sendStatus(204);
};

export const getContent = async (req: Request, res: Response): Promise<Response> => {
    const userId: number | undefined = req.userId;
    
    // Check that userId was passed correctly
    if (!userId) {
        return res.status(401).json({ error: "User not authenticated." });
    }
    
    // Get ids of all user content
    const userContentResponse: UserDataServiceResponse = await userGetContent(userId);
    if(!userContentResponse.success) {
        return res.status(userContentResponse.code!).json({ error: userContentResponse.error! });
    }

    // Create hashmap to map recommended songs to their dates
    const songRecIdsAndDates: { songId: string, date: Date }[] = userContentResponse.data.songRecIdsAndDates;
    const songRecIdToDateMap: { [key: string]: Date } = {};

    // Populate hashmap
    songRecIdsAndDates.forEach(({ songId, date }) => {
        songRecIdToDateMap[songId] = date;
    });

    // Get content data from Spotify
    const contentIds: { 
        songIds: string[], 
        albumIds: string[], 
        artistIds: string[], 
        songRecIds: string[] } 
        = {
            songIds: userContentResponse.data.songIds,
            albumIds: userContentResponse.data.albumIds,
            artistIds: userContentResponse.data.artistIds,
            songRecIds: userContentResponse.data.songRecIdsAndDates.map((item: { songId: string, date: Date }) => item.songId)
        };


    const dataRespose: SpotifyServiceResponse = await spotifyGetContent(contentIds);

    if (!dataRespose.success) {
        return res.status(dataRespose.code!).json({ error: dataRespose.error! });
    }

    // Map raw data to dtos
    const songs: Song[] =  dataRespose.data.songs.map(mapSong);
    const albums: Album[] = dataRespose.data.albums.map(mapAlbum);
    const artists: Artist[] = dataRespose.data.artists.map(mapArtist);
    let songRecs: Song[] = dataRespose.data.songRecs.map(mapSong);
    
    // Add date strings to song recommendations 
    songRecs.forEach((song: Song) => {
        const recDate = songRecIdToDateMap[song.id];
        if (recDate) {
            // Format date as MM/DD/YYYY
            song.recDate = recDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            });
        }
    });

    // Send data
    return res.status(200).json({ songs, albums, artists, songRecs });
};

export const getDeliverySettings = async (req: Request, res: Response): Promise<Response> => {
    const userId: number | undefined = req.userId;
    
    // Check that userId was passed correctly
    if (!userId) {
        return res.status(401).json({ error: "User not authenticated." });
    }
    
    // Get settings
    const response: UserDataServiceResponse = await userGetDeliverySettings(userId);
    if(!response.success) {
        return res.status(response.code!).json({ error: response.error! });
    }

    // Send data
    return res.status(200).json( response.data );
};

export const updateDeliverySetting = async (req: Request, res: Response): Promise<Response> => {
    const userId: number | undefined = req.userId;
    const setting: string | undefined = req.body.setting;
    const value: string | boolean = req.body.value;
    
    // Check that userId was passed correctly
    if (!userId) {
        return res.status(401).json({ error: "User not authenticated." });
    }

    // Check that setting and value are passed properly
    if(!setting || !["frequency", "sendEmails", "sendTexts"].includes(setting)) {
        return res.status(422).json({ error: "setting must be 'frequency', 'sendEmails', or 'sendTexts'." });
    }
    if (setting === "frequency") {
        if (!["DAILY", "THRICE_WEEKLY", "WEEKLY", "BIWEEKLY", "MONTHLY"].includes(value as string)) {
            return res.status(422).json({ error: "Value invalid." });
        }
    } else {
        if (typeof value !== "boolean") {
            return res.status(422).json({ error: "Value invalid." });
        }
    }
    
    // Update setting
    const response: UserDataServiceResponse = await userUpdateDeliverySetting(userId, setting, value);
    if(!response.success) {
        return res.status(response.code!).json({ error: response.error! });
    }

    // Send data
    return res.sendStatus(201);
};

