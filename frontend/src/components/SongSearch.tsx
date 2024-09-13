import { useOutletContext } from "react-router-dom";
import SongTable from "./SongTable";
import { Song } from '@shared/dtos/Song';
import { MoonLoader } from "react-spinners";
import { useEffect, useState } from "react";
import { search, SpotifyServiceResponse } from "../services/spotifyService";

const SongSearch: React.FC = () => {
    const { query } = useOutletContext<{ query: string }>();
    const [state, setState] = useState<"Unloaded" | "Loading" | "Loaded">(query ? "Loading" : "Unloaded");
    const [songs, setSongs] = useState<Song[]>([]);

    const fetchSongs = async () => {
        if (!query) {
            setSongs([]);
            return;
        }

        if (state !== "Loading") {
            setState("Loading");
        }

        const searchResult: SpotifyServiceResponse = await search(query, "song");
        if (!searchResult.success) {
            // Add error message
            setSongs([]);
            setState("Unloaded");
            return;
        }

        // Update items list
        setSongs(searchResult.data);
        setState("Loaded");
    }

    useEffect(() => {
        fetchSongs();
    }, [query]);

    return (
        <div className="outlet-component">
            <div>
                {state === "Loaded" && <SongTable songs={songs} 
                                                  addSongs={true} 
                                                  subtractFromHeight={255}
                                                  phoneSubtractFromHeight={130}/> }
            </div>

            <div className="loader">
                {state === "Unloaded" && <div className="faded-text">Search to load songs</div> }

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

export default SongSearch;