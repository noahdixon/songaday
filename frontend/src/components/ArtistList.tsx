import { useEffect, useState } from "react";
import { Artist } from '@shared/dtos/Artist';
import { useUserContent } from "../context/UserContentContext";
import "./CardList.css"

interface ArtistListProps {
    artists: Artist[],
    addArtists: boolean,
    subtractFromHeight: number
}

const ArtistList: React.FC<ArtistListProps> = ({artists, addArtists=true, subtractFromHeight}) => {
    const { addArtist, removeArtist } = useUserContent();

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; artistIndex: number | null, artist: Artist | null }>({
        x: 0,
        y: 0,
        visible: false,
        artistIndex: null,
        artist: null
    });

    const contextMenuWidth: number = addArtists ? 84 : 109;

    const handleShowMenu = (event: React.MouseEvent, index: number, context: boolean = true) => {
        event.preventDefault(); 

        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const right = rect.right - contextMenuWidth;
        
        setContextMenu({
            x: event.clientX > right ? right : event.clientX,
            y: context ? event.clientY : rect.bottom,
            visible: true,
            artistIndex: index,
            artist: artists[index]
        });
    };

    const handleRemoveArtist = () => {
        if (typeof contextMenu.artist?.id === 'string') {
            removeArtist(contextMenu.artist.id);
        }
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handleAddArtist = async (): Promise<void> => {
        if (contextMenu.artist) {
            addArtist(contextMenu.artist);
        }
        setContextMenu({ artist: null, artistIndex: null, visible: false, x: 0, y: 0 });
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
        <div className="list" style={{ height: `calc(100vh - ${subtractFromHeight}px)` }}>
            {artists.map((artist: Artist, index: number) => (
                <div key={index}
                     className={`card ${contextMenu.artistIndex === index ? "context-menu-active" : ""}`}
                     onContextMenu={(e) => handleShowMenu(e, index)}>

                    <a href={artist.link} target="_blank" rel="noopener noreferrer">
                        <img src={artist.image} alt={`${artist.name}`} className="card-art" />
                    </a>

                    <a href={artist.link} target="_blank" className="card-title">{artist.name}</a>

     
                    <div className="card-bottom-container">
                        <a href={artist.link} target="_blank" rel="noopener noreferrer">
                            <img src="/Spotify_Icon_RGB_White.png" alt="Spotify" className="card-spotify-icon" />
                        </a>
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
                    <button onClick={addArtists ? handleAddArtist : handleRemoveArtist}>
                    {addArtists ? 'Like Artist' : 'Remove Artist'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ArtistList;