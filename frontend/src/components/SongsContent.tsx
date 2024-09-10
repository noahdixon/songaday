import { useUserContent } from "../context/UserContentContext";
import SongTable from "./SongTable";

const SongsContent: React.FC = () => {
    const { songs } = useUserContent();

    return (
        <div className="outlet-component">
            {songs.length > 0 && <SongTable songs={songs} addSongs={false} subtractFromHeight={216}/>}
            {songs.length === 0 &&
                <div className="faded-text loader">
                    You haven't liked any songs yet.
                </div>
            }   
        </div>
    );
}

export default SongsContent;