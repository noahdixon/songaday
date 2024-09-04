import { useUserContent } from "../context/UserContentContext";
import { MoonLoader } from "react-spinners";
import AlbumList from "./AlbumList";

const AlbumsContent: React.FC = () => {
    const { albums, isLoaded } = useUserContent();

    return (
        <div>
            {isLoaded && <AlbumList albums={albums} addAlbums={false} subtractFromHeight={216}/>}

            {!isLoaded && 
            <div className="loader">
                
                <div className="faded-text">Loading liked albums...</div>

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

export default AlbumsContent;