import { Request, Response } from 'express';
import { Album } from '../dtos/Album';
import { Artist } from '../dtos/Artist';
import { Song } from '../dtos/Song';
import { searchContent as spotifySearchContent } from '../services/SpotifyService';

const mapSong = (track: any): Song => {
    return {
        id: track.id,
        link: track.external_urls.spotify,
        title: track.name,
        artists: track.artists.map((artist: any) => ({
            name: artist.name,
            link: artist.external_urls.spotify
        })),
        album: track.album.name,
        albumLink: track.album.external_urls.spotify,
        year: track.album.release_date.split('-')[0], // Extract the year from the release date
        popularity: track.popularity,
        explicit: track.explicit,
        image: (track.album.images[0]?.url || "")
    } as Song;
}

const mapAlbum = (album: any): Album => {
    return {
        id: album.id,
        link: album.external_urls.spotify,
        title: album.name,
        artists: album.artists.map((artist: any) => ({
            name: artist.name,
            link: artist.external_urls.spotify
        })),
        year: album.release_date.split('-')[0], // Extract the year from the release date
        image: (album.images[0]?.url || "")
    } as Song;
}

const mapArtist = (artist: any): Artist => {
    return {
        id: artist.id,
        link: artist.external_urls.spotify,
        name: artist.name,
        image: (artist.images[0]?.url || "")
    } as Artist;
}

export const searchContent = async (req: Request, res: Response): Promise<Response> => {
    const query: string | undefined = req.body.query;
    const entity: string | undefined = req.body.entity;
    
    // Check that query and entity were passed correctly
    if (!query) {
        return res.status(400).json({ error: "Query string is required." });
    }
    if (!entity) {
        return res.status(400).json({ error: "Entity string is required." });
    }
    if (!["track", "album", "artist"].includes(entity)) {
        return res.status(400).json({ error: "Entity must be track, album, or artist." });
    }

    // Search using API
    try {
        const searchResult: any = await spotifySearchContent(query, entity);
        if(!searchResult.success) {
            console.error(searchResult.error)
            return res.status(400).json({ error: "Error fetching data from Spotify" });
        }
        
        // Map over tracks and create array of Song objects
        let content = null;
        switch (entity) {
            case "track":
                content = searchResult.data.tracks.items.map(mapSong);
                break;
            case "album":
                content = searchResult.data.albums.items.map(mapAlbum);
                break;
            case "artist":
                content = searchResult.data.artists.items.map(mapArtist);
                break;
        }

        return res.status(200).json(content);

    } catch (error) {
        return res.status(400).json({ error: "Error fetching data from Spotify" });
    }
};