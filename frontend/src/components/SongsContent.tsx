import { useUserContent } from "../context/UserContentContext";
import { MoonLoader } from "react-spinners";
import SongTable from "./SongTable";

const SongsContent: React.FC = () => {
    const { songs, isLoaded } = useUserContent();

    return (
        <div>
            {isLoaded && <SongTable songs={songs} addSongs={false} subtractFromHeight={216}/>}
            
            {!isLoaded && 
            <div className="loader">
                
                <div className="faded-text">Loading liked songs...</div>

                <MoonLoader
                    color={"var(--pink-color)"}
                    loading={!isLoaded}
                    size={40}
                    aria-label="Loading Spinner"
                    data-testid="moon-loader"
                />
            </div> 
            }
        </div>
    );
}

export default SongsContent;