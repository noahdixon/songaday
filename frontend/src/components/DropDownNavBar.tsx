import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './DropDownNavBar.css';

const DropDownNavBar: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const location = useLocation();
    const [selected, setSelected] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    // Event listener for escape
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    };

    // Event listener for clicks outside the menu
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            closeMenu();
        }
    };

    useEffect(() => {
        const pathname = location.pathname;
        const segments = pathname.split('/');
        setSelected(segments[1]);

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('click', handleClickOutside);

        // Cleanup the event listeners on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [location.pathname]);

    const getMenuLabel = () => {
        switch (selected) {
            case 'recommendations':
                return 'Recommendations';
            case 'search':
                return 'Search';
            case 'content':
                return 'Liked Content';
            case 'attributes':
                return 'Song Attributes';
            case 'settings':
                return 'Delivery Settings';
            case 'about':
                return 'About';
            case 'contact':
                return 'Contact';
            default:
                return 'Menu';
        }
    };

    return (
        <div 
            className={`dropdown-navbar ${isOpen ? 'dropdown-navbar-open' : ''}`} 
            ref={dropdownRef}
        >
            <button className={`dropdown-toggle ${isOpen ? 'dropdown-toggle-open' : ''}`} onClick={toggleMenu}>
                {getMenuLabel()}
                <img 
                    src="/arrow-down.png" 
                    alt="Arrow Down"
                    className={`arrow-icon ${isOpen ? 'open' : ''}`} 
                />
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    {selected !== 'recommendations' && (
                        <Link to="/recommendations" className="dropdown-item" onClick={closeMenu}>
                            Recommendations
                        </Link>
                    )}
                    {selected !== 'search' && (
                        <Link to="/search" className="dropdown-item" onClick={closeMenu}>
                            Search
                        </Link>
                    )}
                    {selected !== 'content' && (
                        <Link to="/content" className="dropdown-item" onClick={closeMenu}>
                            Liked Content
                        </Link>
                    )}
                    {selected !== 'attributes' && (
                        <Link to="/attributes" className="dropdown-item" onClick={closeMenu}>
                            Song Attributes
                        </Link>
                    )}
                    {selected !== 'settings' && (
                        <Link to="/settings" className="dropdown-item" onClick={closeMenu}>
                            Delivery Settings
                        </Link>
                    )}
                    {selected !== 'about' && (
                        <Link to="/about" className="dropdown-item" onClick={closeMenu}>
                            About
                        </Link>
                    )}
                    {selected !== 'contact' && (
                        <Link to="/contact" className="dropdown-item" onClick={closeMenu}>
                            Contact
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default DropDownNavBar;