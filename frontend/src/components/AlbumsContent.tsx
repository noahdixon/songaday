import { useUserContent } from "../context/UserContentContext";
import AlbumList from "./AlbumList";

const AlbumsContent: React.FC = () => {
    const { albums, isLoaded } = useUserContent();

    return (
        <div className="outlet-component">
            {isLoaded && albums.length > 0 && <AlbumList albums={albums} 
                                                         addAlbums={false} 
                                                         subtractFromHeight={217}
                                                         phoneSubtractFromHeight={130}/>}
            {isLoaded && albums.length === 0 &&
                <div className="faded-text loader">
                    You haven't liked any albums yet.
                </div>
            }   
        </div>
    );
}

export default AlbumsContent;