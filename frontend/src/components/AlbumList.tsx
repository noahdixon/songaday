import { useEffect, useState } from "react";
import { Album } from '@shared/dtos/Album';
import { useUserContent } from "../context/UserContentContext";
import "./CardList.css"

interface AlbumListProps {
    albums: Album[],
    addAlbums: boolean,
    subtractFromHeight: number,
    phoneSubtractFromHeight: number
}

const AlbumList: React.FC<AlbumListProps> = ({ albums, addAlbums=true, subtractFromHeight, phoneSubtractFromHeight }) => {
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 481);
    const { addAlbum, removeAlbum } = useUserContent();
    const nullContext = { x: 0, y: 0, visible: false, albumIndex: null, album: null };
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; albumIndex: number | null, album: Album | null }>(nullContext);
    const contextMenuWidth: number = addAlbums ? 90 : 115;
    
    const handleShowMenu = (event: React.MouseEvent, index: number, context: boolean = true) => {
        event.preventDefault(); 

        if (contextMenu.albumIndex === index) {
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
            albumIndex: index,
            album: albums[index]
        });
    };

    const handleRemoveAlbum = () => {
        if (typeof contextMenu.album?.id === 'string') {
            removeAlbum(contextMenu.album.id);
        }
        setContextMenu(nullContext);
    };

    const handleAddAlbum = async (): Promise<void> => {
        if (contextMenu.album) {
            addAlbum(contextMenu.album);
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

    const height = isMobileView ? `calc(100dvh - ${phoneSubtractFromHeight}px)`
                                : `calc(100dvh - ${subtractFromHeight}px)`;

    return (
        <div className="list" style={{ height}}>
            {albums.map((album: Album, index: number) => (
                <div key={index} 
                     className={`card ${contextMenu.albumIndex === index ? "context-menu-active" : ""}`}
                     onContextMenu={(e) => handleShowMenu(e, index)}>

                    <a href={album.link} target="_blank" rel="noopener noreferrer">
                        <img src={album.image} alt={`${album.title} Album Art`} className="card-art" />
                    </a>

                    <a href={album.link} target="_blank" className="card-title">{album.title}</a>
                    
                    <div className="card-subtitle">
                        {album.artists?.map((artist, index) => (
                            <span key={artist.id} className="card-artist">
                                <a href={artist.link} target="_blank" rel="noopener noreferrer">
                                    {artist.name}
                                </a>
                                {index < album.artists!.length - 1 && ', '}
                            </span>
                        ))}
                    </div>

                    <div className="card-bottom-container">
                        <div className="card-sub-subtitle">
                            <a href={album.link} target="_blank" rel="noopener noreferrer">
                                <img src="/Spotify_Icon_RGB_White.png" alt="Spotify" className="card-spotify-icon" />
                            </a>
                            {album.year}
                        </div>
                        <button onClick={(e) => { 
                                            // Stop event from bubbling up to row
                                            e.stopPropagation(); 
                                            handleShowMenu(e, index, false);
                                        }} className="dots-button">
                            <img src="/dots.png" alt="Options" className="dots"/>
                        </button>
                    </div>
                    
                     
                       
                </div>
            ))}
            
            {contextMenu.visible && (
                <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <button onClick={addAlbums ? handleAddAlbum : handleRemoveAlbum}>
                    {addAlbums ? 'Like Album' : 'Remove Album'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default AlbumList;