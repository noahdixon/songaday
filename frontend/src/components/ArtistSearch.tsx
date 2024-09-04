import { useOutletContext } from "react-router-dom";
import ArtistList from "./ArtistList";
import { Artist } from '@shared/dtos/Artist';
import { MoonLoader } from "react-spinners";
import { useEffect, useState } from "react";
import { search, SpotifyServiceResponse } from "../services/spotifyService";

const ArtistSearch: React.FC = () => {
    const { query } = useOutletContext<{ query: string }>();
    const[state, setState] = useState<"Unloaded" | "Loading" | "Loaded">(query ? "Loading" : "Unloaded");
    const [artists, setArtists] = useState<Artist[]>([]);

    const fetchArtists = async () => {
        if (!query) {
            setArtists([]);
            return;
        }

        if (state !== "Loading") {
            setState("Loading");
        }

        const searchResult: SpotifyServiceResponse = await search(query, "artist");
        if (!searchResult.success) {
            // Add error message
            setArtists([]);
            setState("Unloaded");
            return;
        }

        // Update items list
        setArtists(searchResult.data);
        setState("Loaded");
    }

    useEffect(() => {
        fetchArtists();
    }, [query]);

    return (
        <div className="outlet-component">
            <div>
                {state === "Loaded" && <ArtistList artists={artists} addArtists={true} subtractFromHeight={255} /> }
            </div>

            <div className="loader">
                {state === "Unloaded" && <div className="faded-text">Search to load artists</div> }

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

export default ArtistSearch;