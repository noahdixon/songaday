import { Album } from "@shared/dtos/Album";
import { Artist } from "@shared/dtos/Artist";
import { Song } from "@shared/dtos/Song";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getContent, likeContent, removeContent, UserServiceResponse } from "../services/userService";

interface UserContentContextType {
    songs: Song[];
    addSong: (song: Song) => void;
    removeSong: (songId: string) => void;
    albums: Album[];
    addAlbum: (album: Album) => void;
    removeAlbum: (albumId: string) => void;
    artists: Artist[];
    addArtist: (artist: Artist) => void;
    removeArtist: (artistId: string) => void;
    isLoaded: boolean;
    errorMessage: string | null;
}

const UserContentContext = createContext<UserContentContextType | null>(null);

export const useUserContent = () => {
    const context = useContext(UserContentContext);
    if(!context) {
        throw new Error("useUserContent must be used within a UserContentProvider");
    }
    return context;
}

export const UserContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserContent = async () => {
            try {
                // Make API calls to fetch the user's content
                const getContentResponse: UserServiceResponse = await getContent();
                if (!getContentResponse.success) {
                    if (getContentResponse.error === "SPOTIFY_RATE_LIMITED") {
                        toast.error("Spotify deined content fetch.");
                        setErrorMessage("Sorry. Songaday has sent too many queries to Spotify in the last few moments. Please wait a few minutes and try reloading the site.");
                    } else {
                        toast.error("An error occurred while fetching user content.");
                        setErrorMessage("Sorry. An unexpected error occurred. Please wait a few minutes and try reloading the site.");
                    }
                    return;
                }

                // Set user content
                setSongs(getContentResponse.data.songs);
                setAlbums(getContentResponse.data.albums);
                setArtists(getContentResponse.data.artists);

                setIsLoaded(true); // End loading

            } catch (error) {
                console.error("Failed to fetch user content:", error);
            }
        };

        fetchUserContent();
    }, []);

    const addSong = async (song: Song) => {
        // Add song to likes on db
        const response: UserServiceResponse = await likeContent(song.id, "song");
        if (!response.success) {
            toast.error(response.error);
            return;
        }
        // Add song to likes in state
        setSongs((prevSongs) => [...prevSongs, song]);
        toast.success("Song added to liked content.");
    };

    const removeSong = async (songId: string) => {
        // Remove song from likes on db
        const response: UserServiceResponse = await removeContent(songId, "song");
        if (!response.success) {
            toast.error(response.error);
            return;
        }

        // Remove song from likes in state
        setSongs((prevSongs) => prevSongs.filter(song => song.id !== songId));
        toast.success("Song removed.");
    };

    const addAlbum = async (album: Album) => {
        // Add album to likes on db
        const response: UserServiceResponse = await likeContent(album.id, "album");
        if (!response.success) {
            toast.error(response.error);
            return;
        }
        // Add album to likes in state
        setAlbums((prevAlbums) => [...prevAlbums, album]);
        toast.success("Album added to liked content.");
    };

    const removeAlbum = async (albumId: string) => {
        // Remove album from likes on db
        const response: UserServiceResponse = await removeContent(albumId, "album");
        if (!response.success) {
            toast.error(response.error);
            return;
        }

        // Remove album from likes in state
        setAlbums((prevAlbums) => prevAlbums.filter(album => album.id !== albumId));
        toast.success("Album removed.");
    };

    const addArtist = async (artist: Artist) => {
        // Add artist to likes on db
        const response: UserServiceResponse = await likeContent(artist.id, "artist");
        if (!response.success) {
            toast.error(response.error);
            return;
        }
        // Add artist to likes in state
        setArtists((prevArtists) => [...prevArtists, artist]);
        toast.success("Artist added to liked content.");
    };

    const removeArtist = async (artistId: string) => {
        // Remove artist from likes on db
        const response: UserServiceResponse = await removeContent(artistId, "artist");
        if (!response.success) {
            toast.error(response.error);
            return;
        }

        // Remove artist from likes in state
        setArtists((prevArtists) => prevArtists.filter(artist => artist.id !== artistId));
        toast.success("Artist removed.");
    };

    return (
        <UserContentContext.Provider value={{
            songs,
            addSong,
            removeSong,
            albums,
            addAlbum,
            removeAlbum,
            artists,
            addArtist,
            removeArtist,
            isLoaded,
            errorMessage
        }}>
            {children}
        </UserContentContext.Provider>
    );
}