import { useEffect, useState } from "react";
import "./CardList.css"

interface Album {
    title: string;
    albumLink: string;
    year: string;
    artist: string;
    artist_link: string;
    albumArt: string;
}

let albums: Album[] = [

];

const AlbumList: React.FC = () => {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; albumIndex: number | null, album: Album | null }>({
        x: 0,
        y: 0,
        visible: false,
        albumIndex: null,
        album: null
    });

    const handleShowMenu = (event: React.MouseEvent, index: number, context: boolean = true) => {
        event.preventDefault(); 

        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const right = rect.right - 115;
        setContextMenu({
            x: event.clientX > right ? right : event.clientX,
            y: context ? event.clientY : rect.bottom,
            visible: true,
            albumIndex: index,
            album: albums[index]
        });
    };

    const handleRemoveAlbum = () => {
        if (contextMenu.albumIndex !== null) {
            // Logic to remove the song
            albums = albums.filter((album) => album != contextMenu.album)

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
        <div className="list">
            {albums.map((album: Album, index: number) => (
                <div key={index} 
                     className={`card ${contextMenu.albumIndex === index ? "context-menu-active" : ""}`}
                     onContextMenu={(e) => handleShowMenu(e, index)}>

                    <a href={album.albumLink} target="_blank" rel="noopener noreferrer">
                        <img src={album.albumArt} alt={`${album.title} Album Art`} className="card-art" />
                    </a>

                    <a href={album.albumLink} target="_blank" className="card-title">{album.title}</a>
                    <a href={album.artist_link} target="_blank" className="card-subtitle">{album.artist}</a>

                    <div className="card-bottom-container">
                        <div className="card-sub-subtitle">
                            <a href={album.albumLink} target="_blank" rel="noopener noreferrer">
                                <img src="/Spotify_Icon_RGB_White.png" alt="Spotify" className="card-spotify-icon" />
                            </a>
                            {album.year}
                        </div>
                        <button onClick={(e) => { 
                                                // Stop event from bubbling up to row
                                                e.stopPropagation(); 
                                                handleShowMenu(e, index, false);
                                                }}>
                            <img src="/dots.png" alt="Options" className="dots"/>
                        </button>
                    </div>
                    
                     
                       
                </div>
            ))}
            
            {contextMenu.visible && (
                <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <button onClick={handleRemoveAlbum}>Remove Album</button>
                </div>
            )}
        </div>
    );
}

export default AlbumList;