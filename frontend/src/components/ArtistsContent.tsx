import { useUserContent } from "../context/UserContentContext";
import ArtistList from "./ArtistList";

const ArtistsContent: React.FC = () => {
    const { artists, isLoaded } = useUserContent();

    return (
        <div className="outlet-component">
            {isLoaded && artists.length > 0 && <ArtistList artists={artists} addArtists={false} subtractFromHeight={216}/>}
            {isLoaded && artists.length === 0 &&
                <div className="faded-text loader">
                    You haven't liked any artists yet.
                </div>
            }  
        </div>
    );
}

export default ArtistsContent;