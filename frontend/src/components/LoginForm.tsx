import React from 'react';
import { useState } from 'react';
import AuthForm from './AuthForm';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { login, logout } from '../services/authService';
import { toast } from 'react-toastify';

const LoginForm: React.FC = () => {
    const [errorMessage, setErrorMessage] = useState<string>("");
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(isLoggedIn) {
            navigate("/home");
            return;
        }
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const loginResult = await login(email, password);
            if (loginResult.success) {
                setIsLoggedIn(true);
                setErrorMessage("");
                navigate("/home");
                toast.success("Login successful.")
            } else {
                setErrorMessage(loginResult.error!);
            }
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    return <AuthForm onSubmit={handleLogin} 
                     buttonText="Login" 
                     errorMessage={errorMessage} 
                     otherFormLink="/register" 
                     otherFormMessage="Don't have an account? Sign Up."/>;
};

export default LoginForm;