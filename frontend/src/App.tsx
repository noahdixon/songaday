import React from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { LoggedInRoute, LoggedOutRoute } from './components/ProtectedRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
    return (
        <div>
            <ToastContainer
            position="top-center"
            autoClose={2000}
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
                    <Route index element={<HomePage/>} />
                    <Route path="/home" element={<HomePage/>} />
                    <Route path="/login" element={<LoggedOutRoute element={<LoginPage />} />} />
                    <Route path="/register" element={<LoggedOutRoute element={<RegisterPage />} />} />
                </Routes>
            </BrowserRouter>
        </div>
        
    );
};

export default App;