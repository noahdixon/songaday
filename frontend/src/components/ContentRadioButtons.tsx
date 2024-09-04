import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import './ContentRadioButtons.css';

interface ContentRadioButtonsProps {
    setEntity: (newEntity: string) => void;
}

const ContentRadioButtons: React.FC<ContentRadioButtonsProps> = ({ setEntity }) => {
    const [selected, setSelected] = useState<string>("songs");
    const location = useLocation();

    useEffect(() => {
        const pathname = location.pathname;
        const segments = pathname.split('/');
        const currentPath = segments[2];
        setSelected(currentPath);
        setEntity(currentPath);
    }, [location.pathname]);

    return (
        <div>
            <div className="content-radio-container">
                <Link to="songs" className={`content-radio-item ${selected === 'songs' ? 'selected' : ''}`}>
                    Songs
                </Link>
                <Link to="albums" className={`content-radio-item ${selected === 'albums' ? 'selected' : ''}`}>
                    Albums
                </Link>
                <Link to="artists" className={`content-radio-item ${selected === 'artists' ? 'selected' : ''}`}>
                    Artists
                </Link>
            </div>
        </div>
    );
}

export default ContentRadioButtons;