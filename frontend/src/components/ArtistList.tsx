import { useEffect, useState } from "react";
import "./CardList.css"

interface Artist {
    name: string;
    artistLink: string;
    artistImg: string;
}

let artists: Artist[] = [
    
];

const ArtistList: React.FC = () => {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; artistIndex: number | null, artist: Artist | null }>({
        x: 0,
        y: 0,
        visible: false,
        artistIndex: null,
        artist: null
    });

    const handleShowMenu = (event: React.MouseEvent, index: number, context: boolean = true) => {
        event.preventDefault(); 

        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const right = rect.right - 109;
        setContextMenu({
            x: event.clientX > right ? right : event.clientX,
            y: context ? event.clientY : rect.bottom,
            visible: true,
            artistIndex: index,
            artist: artists[index]
        });
    };

    const handleRemoveArtist = () => {
        if (contextMenu.artistIndex !== null) {
            // Logic to remove the song
            artists = artists.filter((artist) => artist != contextMenu.artist)

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
            {artists.map((artist: Artist, index: number) => (
                <div key={index}
                     className={`card ${contextMenu.artistIndex === index ? "context-menu-active" : ""}`}
                     onContextMenu={(e) => handleShowMenu(e, index)}>

                    <a href={artist.artistLink} target="_blank" rel="noopener noreferrer">
                        <img src={artist.artistImg} alt={`${artist.name}`} className="card-art" />
                    </a>

                    <a href={artist.artistLink} target="_blank" className="card-title">{artist.name}</a>

     
                    <div className="card-bottom-container">
                        <a href={artist.artistLink} target="_blank" rel="noopener noreferrer">
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
                    <button onClick={handleRemoveArtist}>Remove Artist</button>
                </div>
            )}
        </div>
    );
}

export default ArtistList;