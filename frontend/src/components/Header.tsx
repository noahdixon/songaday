import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import { toast } from 'react-toastify';
import "./Header.css";
import DropDownNavBar from './DropDownNavBar';

const Header: React.FC = () => {
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);  // Toggle the dropdown visibility
    };

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
    
        // Close dropdown if click is outside the profile-container
        if (dropdownVisible && target && !target.closest('.profile-container')) {
            setDropdownVisible(false);
        }
    };

    const handleLogout = async (event: React.MouseEvent) => {
        event?.preventDefault()
        await logout();
        setIsLoggedIn(false);
        navigate("/login");
        toast.success("Logout successful.");
    }

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setDropdownVisible(false); // Close dropdown when Escape is pressed
        }
    };

    // Add event listeners for clicks outside the dropdown and keydown for Escape key
    React.useEffect(() => {
        if (dropdownVisible) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        } else {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [dropdownVisible]);

    return (
        <div className="header">
            <Link to="/" className="logo-link">
                <img src="/songaday-logo.png" alt="Songaday Logo" className="logo" />
            </Link>

            <DropDownNavBar></DropDownNavBar>

            <div className="profile-container" onClick={toggleDropdown}>
                <img src="/user-profile.png" alt="User Profile" className="profile" />
                {dropdownVisible && (
                    <div className="header-dropdown-menu">
                        <Link to="/profile" className="header-dropdown-item header-dropdown-item-top">Edit Profile</Link>
                        <button className="header-dropdown-item header-dropdown-item-bottom" onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;