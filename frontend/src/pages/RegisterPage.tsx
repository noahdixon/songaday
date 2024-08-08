import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const RegisterPage: React.FC = () => {
    return (
        <div>
            <h1>Register</h1>
            <RegisterForm />
        </div>
    );
};

export default RegisterPage;