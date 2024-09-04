import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import ContentRadioButtons from "../components/ContentRadioButtons";

const SearchOutlet: React.FC = () => {
    const [query, setQuery] = useState<string>("");

    const inputRef = useRef<HTMLInputElement>(null);

    const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setQuery(e.currentTarget.value);
        }
    };

    const handleEntityChanged = () => {
        if (inputRef.current) {
            inputRef.current.value = query;
        }
    };

    return (
        <div className="outlet">
            <div className="top-section">
                <div className="logo-radio">
                    <a href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">
                        <img src="/Spotify_Logo_RGB_White.png" alt="Spotify Logo" className="spotify-radio-logo spotify-logo" />
                    </a>
                    <div className="search-bar">
                        <button onClick={() => setQuery(inputRef.current?.value || '')}>
                            <img src="/search.png" alt="Search" className="search-icon" />
                        </button>
                        <input
                            className="search-input"
                            type="text"
                            placeholder="Search Spotify Content..."
                            ref={inputRef}
                            onKeyPress={handleEnter}
                        />
                    </div>
                </div>
                <ContentRadioButtons setEntity={handleEntityChanged} />
            </div>
            <Outlet context={{ query }} key={query} />
        </div>
    );
}

export default SearchOutlet;
