import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import { toast } from 'react-toastify';
import "../global.css";
import "./Header.css";

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

    // Add event listener to detect clicks outside the dropdown
    React.useEffect(() => {
        if (dropdownVisible) {
            document.addEventListener('click', handleClickOutside);
        } else {
            document.removeEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [dropdownVisible]);

    return (
        <div className="header">
            <Link to="/" className="logo-link">
                <img src="/songaday-logo.png" alt="Songaday Logo" className="logo" />
            </Link>
            <div className="profile-container" onClick={toggleDropdown}>
                <img src="/user-profile.png" alt="User Profile" className="profile" />
                {dropdownVisible && (
                    <div className="dropdown-menu">
                        <Link to="/profile" className="dropdown-item dropdown-item-top">Edit Profile</Link>
                        <button className="dropdown-item dropdown-item-bottom" onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;