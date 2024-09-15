import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    const [selected, setSelected] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        const pathname = location.pathname;
        const segments = pathname.split('/');
        setSelected(segments[1]);
    }, [location.pathname]);

    return (
        <div className="sidebar">
            <Link to="/recommendations" className={`sidebar-item ${selected === 'recommendations' ? 'selected' : ''}`}>
                Recommendations
            </Link>
            <Link to="/search" className={`sidebar-item ${selected === 'search' ? 'selected' : ''}`}>
                Search
            </Link>
            <Link to="/content" className={`sidebar-item ${selected === 'content' ? 'selected' : ''}`}>
                Liked Content
            </Link>
            {/* <Link to="/attributes" className={`sidebar-item ${selected === 'attributes' ? 'selected' : ''}`}>
                Song Attributes
            </Link> */}
            <Link to="/settings" className={`sidebar-item ${selected === 'settings' ? 'selected' : ''}`}>
                Delivery Settings
            </Link>
            <Link to="/about" className={`sidebar-item ${selected === 'about' ? 'selected' : ''}`}>
                About
            </Link>
            <Link to="/contact" className={`sidebar-item ${selected === 'contact' ? 'selected' : ''}`}>
                Contact
            </Link>
        </div>
    );
};

export default Sidebar;