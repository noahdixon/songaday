import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { LoggedInRoute, LoggedOutRoute } from './components/ProtectedRoutes';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LayoutPage from './pages/LayoutPage';
import RecommendationsOutlet from './outlets/RecommendationsOutlet';
import ContentOutlet from './outlets/ContentOutlet';
import SearchOutlet from './outlets/SearchOutlet';
import AttributesOutlet from './outlets/AttributesOutlet';
import SettingsOutlet from './outlets/SettingsOutlet';
import AboutOutlet from './outlets/AboutOutlet';
import ContactOutlet from './outlets/ContactOutlet';
import ProfileOutlet from './outlets/ProfileOutlet';
import SongsContent from './components/SongsContent';
import AlbumsContent from './components/AlbumsContent';
import ArtistsContent from './components/ArtistsContent';
import "./global.css"

const App: React.FC = () => {
    return (
        <div>
            <ToastContainer
            position="top-center"
            autoClose={1000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"/>
            <BrowserRouter>
                <Routes>
                    <Route path="/originalHome" element={<HomePage/>} />
                    <Route path="/login" element={<LoggedOutRoute element={<LoginPage />} />} />
                    <Route path="/register" element={<LoggedOutRoute element={<RegisterPage />} />} />
                    <Route path="/" element={<LoggedInRoute element={<LayoutPage/>} />}>
                        <Route index element={<Navigate to="recommendations" />} />
                        <Route path="/home" element={<Navigate to="/recommendations" />} />
                        <Route path="recommendations" element={<RecommendationsOutlet />} />
                        <Route path="search" element={<SearchOutlet />} />
                        <Route path="content" element={<ContentOutlet />}>
                            <Route index element={<Navigate to="songs" />} />
                            <Route path="songs" element={<SongsContent />} />
                            <Route path="albums" element={<AlbumsContent />} />
                            <Route path="artists" element={<ArtistsContent />} />
                        </Route>
                        <Route path="attributes" element={<AttributesOutlet />} />
                        <Route path="settings" element={<SettingsOutlet />} />
                        <Route path="about" element={<AboutOutlet />} />
                        <Route path="contact" element={<ContactOutlet />} />
                        <Route path="profile" element={<ProfileOutlet />} />
                    </Route>
                    {/* <Route path="/home" element={<HomePage/>} /> */}
                </Routes>
            </BrowserRouter>
        </div>
        
    );
};

export default App;