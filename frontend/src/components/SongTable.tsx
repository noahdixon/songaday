import { useEffect, useState } from "react";
import { Song } from '@shared/dtos/Song';
import { useUserContent } from "../context/UserContentContext";
import "./SongTable.css"

interface SongTableProps {
    songs: Song[],
    addSongs: boolean,
    subtractFromHeight: number,
    phoneSubtractFromHeight: number,
    isRecommendations?: boolean
}

const SongTable: React.FC<SongTableProps> = ({ songs, addSongs=true, subtractFromHeight, phoneSubtractFromHeight, isRecommendations=false }) => {
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 481);
    const { addSong, removeSong } = useUserContent();
    const nullContext = { x: 0, y: 0, visible: false, songIndex: null, song: null };
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; songIndex: number | null, song: Song | null }>(nullContext);
    const contextMenuWidth: number = addSongs ? 81 : 106;

    const handleShowMenu = (event: React.MouseEvent, index: number, context: boolean = true) => {
        event.preventDefault(); 

        if (contextMenu.songIndex === index) {
            setContextMenu(nullContext);
            return;
        }

        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const right = rect.right - contextMenuWidth;

        setContextMenu({
            x: event.clientX > right ? right : event.clientX,
            y: context ? event.clientY : rect.bottom,
            visible: true,
            songIndex: index,
            song: songs[index]
        });
    };

    const handleRemoveSong = () => {
        if (typeof contextMenu.song?.id === 'string') {
            removeSong(contextMenu.song.id);
        }
        setContextMenu(nullContext);
    };

    const handleAddSong = async (): Promise<void> => {
        if (contextMenu.song) {
            addSong(contextMenu.song);
        }
        setContextMenu(nullContext);
    };

    const handleClickOutside = () => {
        setContextMenu(nullContext);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            setContextMenu(nullContext);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 481);
        };
        window.addEventListener('resize', handleResize);

        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        // Cleanup event listeners when component is unmounted
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const height = isMobileView ? `calc(100vh - ${phoneSubtractFromHeight}px)`
                                : `calc(100vh - ${subtractFromHeight}px)`;

    return (
        <div>
            <table style={{ height }}>
                <thead>
                    <tr>
                        {!isRecommendations && <th className="num-col first-head">#</th>}
                        {isRecommendations && <th className="num-col first-head">Date</th>}
                        <th><div className="song-spotify-icon" /></th>
                        <th><div className="song-album-art" /></th>
                        <th>Title</th>
                        <th className="album-col">Album</th>
                        <th className="year-col">Year</th>
                        <th className="popularity-col">Popularity</th>
                        <th className="last-head"></th>
                    </tr>

                    <tr>
                        <th colSpan={8} className="line-box">
                            <hr className="line"/>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {songs.map((song: Song, index: number) => (
                        <tr key={index} 
                            className={`song-entry ${contextMenu.songIndex === index ? "context-menu-active" : ""}`}
                            onContextMenu={(e) => handleShowMenu(e, index)}
                            >
                            {!isRecommendations && <td className="num-col">{index+1}</td> }
                            {isRecommendations && <td className="num-col">{song.recDate ? song.recDate : "No Date"}</td> }
                            <td>
                                <a href={song.link} target="_blank" className="title">
                                    <img src="/Spotify_Icon_RGB_White.png" alt="Spotify" className="song-spotify-icon" />
                                </a>
                            </td>
                            <td>
                                <a href={song.albumLink} target="_blank" rel="noopener noreferrer">
                                    <img src={song.image} alt={`${song.album} Album Art`} className="song-album-art" />
                                </a>
                            </td>
                            <td><div className="title-artist">
                                    <a href={song.link} target="_blank" className="title">{song.title}</a>
                                    <div className="artist">
                                        {song.artists?.map((artist, index) => (
                                            <span key={artist.id} className="artist">
                                                <a href={artist.link} target="_blank" rel="noopener noreferrer">
                                                    {artist.name}
                                                </a>
                                                {index < song.artists.length - 1 && ', '}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </td>
                            <td className="album-col"><a href={song.albumLink} target="_blank">{song.album}</a></td>
                            <td className="year-col">{song.year}</td>
                            <td className="popularity-col">{song.popularity}</td>
                            <td className="dots-cell">
                                <button onClick={(e) => { 
                                            // Stop event from bubbling up to row
                                            e.stopPropagation(); 
                                            handleShowMenu(e, index, false);
                                        }} 
                                        className="dots-button">
                                    <img src="/dots.png" alt="Options" className="dots"/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {contextMenu.visible && (
                <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <button onClick={addSongs ? handleAddSong : handleRemoveSong}>
                    {addSongs ? 'Like Song' : 'Remove Song'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default SongTable;