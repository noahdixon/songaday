import React from 'react';
import { useState } from 'react';
import AuthForm from './AuthForm';
import { register } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RegisterForm: React.FC = () => {
    const [errorMessage, setErrorMessage] = useState<string>("");
    const navigate = useNavigate();

    const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const password = formData.get('password') as string;

        const registerResult = await register(email, password, phone);
        if (registerResult.success) {
            setErrorMessage("");
            navigate("/login");
            toast.success("Registration successful! Please log in.");
        } else {
            setErrorMessage(registerResult.error!);
        }
    };

    return <AuthForm onSubmit={handleRegister} 
                     buttonText="Register" 
                     errorMessage={errorMessage} 
                     otherFormLink="/login" 
                     otherFormMessage="Already have an account? Sign in."/>;
};

export default RegisterForm;