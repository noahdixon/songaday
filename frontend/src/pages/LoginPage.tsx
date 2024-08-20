import React, { useEffect } from 'react';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {;
    return (
        <div className="app-container">
            <h1>Login</h1>
            <LoginForm />
        </div>
    );
};

export default LoginPage;