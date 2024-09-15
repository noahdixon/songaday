import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { LoggedInRoute, LoggedOutRoute } from './components/ProtectedRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthPage from './pages/AuthPage';
import LoginOutlet from './outlets/LoginOutlet';
import RegisterOutlet from './outlets/RegisterOutlet';
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
import SongSearch from './components/SongSearch';
import AlbumSearch from './components/AlbumSearch';
import ArtistSearch from './components/ArtistSearch';
import { UserContentProvider } from './context/UserContentContext';
import "./global.css"

const App: React.FC = () => {
    return (
        <div>
            <ToastContainer
            position="top-center"
            // autoClose={1500}
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
                    <Route path="/login" element={<Navigate to="/auth/login" />} />
                    <Route path="/signin" element={<Navigate to="/auth/login" />} />
                    <Route path="/register" element={<Navigate to="/auth/register" />} />
                    <Route path="/signup" element={<Navigate to="/auth/register" />} />
                    <Route path="/auth" element={<LoggedOutRoute element={<AuthPage />} />}>
                        <Route index element={<Navigate to="login" />} />
                        <Route path="signin" element={<Navigate to="/login" />} />
                        <Route path="login" element={<LoginOutlet />} />
                        <Route path="signup" element={<Navigate to="/register" />} />
                        <Route path="register" element={<RegisterOutlet />} />
                    </Route>
                    <Route path="/" element={<LoggedInRoute element={
                                                                        <UserContentProvider>
                                                                            <LayoutPage/>
                                                                        </UserContentProvider>
                                                                    } />}>
                        <Route index element={<Navigate to="recommendations" />} />
                        <Route path="/home" element={<Navigate to="/recommendations" />} />
                        <Route path="recommendations" element={<RecommendationsOutlet />} />
                        <Route path="search" element={<SearchOutlet />}>
                            <Route index element={<Navigate to="songs" />} />
                            <Route path="songs" element={<SongSearch/>} />
                            <Route path="albums" element={<AlbumSearch />} />
                            <Route path="artists" element={<ArtistSearch />} />
                        </Route>
                        <Route path="content" element={<ContentOutlet />}>
                            <Route index element={<Navigate to="songs" />} />
                            <Route path="songs" element={<SongsContent />} />
                            <Route path="albums" element={<AlbumsContent />} />
                            <Route path="artists" element={<ArtistsContent />} />
                        </Route>
                        {/* <Route path="attributes" element={<AttributesOutlet />} /> */}
                        <Route path="settings" element={<SettingsOutlet />} />
                        <Route path="about" element={<AboutOutlet />} />
                        <Route path="contact" element={<ContactOutlet />} />
                        <Route path="profile" element={<ProfileOutlet />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
        
    );
};

export default App;