import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { logout } from '../services/authService';
import { getPosts } from '../services/tempPostService';
import { toast } from 'react-toastify';

const HomePage: React.FC = () => {
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        const fetchPosts = async () => {
            if(!isLoggedIn) {
                setPosts(["User is not logged in"]);
                return;
            }

            try {
                const getPostsResult = await getPosts();
                if(getPostsResult.success) {
                    setPosts(getPostsResult.posts.map((post: any) => post.message))
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            }
        };

        fetchPosts();
    }, [isLoggedIn]);


    const handleLogout = async () => {
        logout();
        setIsLoggedIn(false);
        navigate("/login");
        toast.success("Logout successful.");
    }

    return (
        <div>
            <h1>Home Page</h1>
            <p>Welcome!</p>
            <ul>
                {posts.map((post: any, index) => (
                    <li key={index}>{post}</li>
                ))}
            </ul>
            {!isLoggedIn && <Link to="/login">Login</Link>}
            <div>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </div>
            {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
        </div>
    );
};

export default HomePage;