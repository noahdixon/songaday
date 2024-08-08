import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {;
    return (
        <div>
            <h1>Login</h1>
            <LoginForm />
        </div>
    );
};

export default LoginPage;