import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import './ContentRadioButtons.css';

const ContentRadioButtons: React.FC = () => {

    const [selected, setSelected] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        const pathname = location.pathname;
        const segments = pathname.split('/');
        setSelected(segments[2]);
    }, [location.pathname]);

    return (
        <div>
            <div className="content-radio-container">
                <a href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">
                    <img src="/Spotify_Logo_RGB_White.png" alt="Spotify Logo" className="spotify-radio-logo spotify-logo"/>
                </a>
                <Link to="songs" className={`content-radio-item ${selected === 'songs' ? 'selected' : ''}`}>
                    Songs
                </Link>
                <Link to="albums" className={`content-radio-item ${selected === 'albums' ? 'selected' : ''}`}>
                    Albums
                </Link>
                <Link to="artists" className={`content-radio-item ${selected === 'artists' ? 'selected' : ''}`}>
                    Artists
                </Link>
            </div>
        </div>
    );
}

export default ContentRadioButtons;