import { useState } from "react";
import { Outlet } from "react-router-dom";
import ContentRadioButtons from "../components/ContentRadioButtons";

const ContentOutlet: React.FC = () => {
    const [entity, setEntity] = useState<string>("songs");

    return (
        <div className="outlet">
            <div className="top-section">
                <div className="logo-radio">
                    <a href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">
                        <img src="/Spotify_Logo_RGB_White.png" alt="Spotify Logo" className="spotify-radio-logo-less spotify-logo"/>
                    </a>
                    <ContentRadioButtons setEntity={setEntity}/>
                </div>
            </div>
            <Outlet />
        </div>
    );
}

export default ContentOutlet;