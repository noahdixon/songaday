import { useEffect, useState } from "react";
import "./SongTable.css"

interface Song {
    title: string;
    songLink: string;
    album: string;
    albumLink: string;
    popularity: number;
    year: string;
    artist: string;
    artistLink: string;
    albumArt: string;
}

let songs: Song[] = [
    
];

const SongTable: React.FC = () => {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; songIndex: number | null, song: Song | null }>({
        x: 0,
        y: 0,
        visible: false,
        songIndex: null,
        song: null
    });

    const handleShowMenu = (event: React.MouseEvent, index: number, context: boolean = true) => {
        event.preventDefault(); 

        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const right = rect.right - 106;

        setContextMenu({
            x: event.clientX > right ? right : event.clientX,
            y: context ? event.clientY : rect.bottom,
            visible: true,
            songIndex: index,
            song: songs[index]
        });
    };

    const handleRemoveSong = () => {
        if (contextMenu.songIndex !== null) {
            // Logic to remove the song
            songs = songs.filter((song) => song != contextMenu.song)

        }
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handleClickOutside = () => {
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            setContextMenu({ ...contextMenu, visible: false });
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);


        // Cleanup event listener when component is unmounted
        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th className="num-col first-head">#</th>
                        <th><div className="song-spotify-icon" /></th>
                        <th><div className="song-album-art" /></th>
                        <th>Title</th>
                        <th>Album</th>
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
                            <td className="num-col">{index+1}</td>
                            <td>
                                <a href={song.songLink} target="_blank" className="title">
                                    <img src="/Spotify_Icon_RGB_White.png" alt="Spotify" className="song-spotify-icon" />
                                </a>
                            </td>
                            <td>
                                <a href={song.albumLink} target="_blank" rel="noopener noreferrer">
                                    <img src={song.albumArt} alt={`${song.album} Album Art`} className="song-album-art" />
                                </a>
                            </td>
                            <td><div className="title-artist">
                                    <a href={song.songLink} target="_blank" className="title">{song.title}</a>
                                    <a href={song.artistLink} target="_blank" className="artist">{song.artist}</a>
                                </div></td>
                            <td><a href={song.albumLink} target="_blank">{song.album}</a></td>
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
                    <button onClick={handleRemoveSong}>Remove Song</button>
                </div>
            )}
        </div>
    );
}

export default SongTable;