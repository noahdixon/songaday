import { useUserContent } from "../context/UserContentContext";
import { MoonLoader } from "react-spinners";
import ArtistList from "./ArtistList";

const ArtistsContent: React.FC = () => {
    const { artists, isLoaded } = useUserContent();

    return (
        <div>
            {isLoaded && <ArtistList artists={artists} addArtists={false} subtractFromHeight={216}/>}

            {!isLoaded && 
            <div className="loader">
                
                <div className="faded-text">Loading liked artists...</div>

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

export default ArtistsContent;