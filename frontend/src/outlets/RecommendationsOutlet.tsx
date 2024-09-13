import { MoonLoader } from "react-spinners";
import SongTable from "../components/SongTable";
import { useUserContent } from "../context/UserContentContext";
import "./RecommendationsOutlet.css"

const RecommendationsOutlet: React.FC = () => {
    const { songRecs, isLoaded } = useUserContent();

    return (
        <div className="outlet">
            <div className="top-section">
                <div className="logo-radio">
                    <a href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">
                        <img src="/Spotify_Logo_RGB_White.png" alt="Spotify Logo" className="spotify-radio-logo-less spotify-logo"/>
                    </a>
                    <div className="recommendations-text">
                        Showing your recommended songs for the past 31 days.
                    </div>
                </div>
            </div>
            <hr className="phone-line"/>
            <div className="outlet-component">
                {isLoaded && songRecs.length > 0 && <SongTable songs={songRecs} addSongs={true} subtractFromHeight={216} isRecommendations={true}/>}
                {songRecs.length === 0 &&
                    <div className="faded-text loader">
                        No recent recommendations.
                    </div>
                }
            </div>
        </div>
    );
}

export default RecommendationsOutlet;