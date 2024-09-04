import { useOutletContext } from "react-router-dom";
import { Album } from '@shared/dtos/Album';
import AlbumList from "./AlbumList";
import { MoonLoader } from "react-spinners";
import { useEffect, useState } from "react";
import { search, SpotifyServiceResponse } from "../services/spotifyService";

const AlbumSearch: React.FC = () => {
    const { query } = useOutletContext<{ query: string }>();
    const[state, setState] = useState<"Unloaded" | "Loading" | "Loaded">(query ? "Loading" : "Unloaded");
    const [albums, setAlbums] = useState<Album[]>([]);

    const fetchAlbums = async () => {
        if (!query) {
            setAlbums([]);
            return;
        }

        if (state !== "Loading") {
            setState("Loading");
        }

        const searchResult: SpotifyServiceResponse = await search(query, "album");
        if (!searchResult.success) {
            // Add error message
            setAlbums([]);
            setState("Unloaded");
            return;
        }

        // Update items list
        setAlbums(searchResult.data);
        setState("Loaded");
    }

    useEffect(() => {
        fetchAlbums();
    }, [query]);

    return (
        <div className="outlet-component">
            <div>
                {state === "Loaded" && <AlbumList albums={albums} addAlbums={true} subtractFromHeight={255} /> }
            </div>

            <div className="loader">
                {state === "Unloaded" && <div className="faded-text">Search to load albums</div> }

                <MoonLoader
                    color={"var(--pink-color)"}
                    loading={state === "Loading"}
                    size={40}
                    aria-label="Loading Spinner"
                    data-testid="moon-loader"
                />
            </div>
        </div>
    );
}

export default AlbumSearch;