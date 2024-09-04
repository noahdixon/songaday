import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import PasswordInput from '../components/PasswordInput';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';

const LoginOutlet: React.FC = () => {
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
    const { validateEmail } = useOutletContext<{ validateEmail: (email: string) => boolean, validatePhone: (phone: string) => boolean}>();
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(isLoggedIn) {
            navigate("/");
            return;
        }
        const loginResult = await login(email, password);
        if (loginResult.success) {
            setIsLoggedIn(true);
            setErrorMessage("");
            navigate("/");
            toast.success("Login successful.")
        } else {
            setErrorMessage(loginResult.error!);
        }
    };

    // Form validity check
    const isFormValid = isEmailValid && password;

    return (
        <div className="auth-content">
            <h1 className="auth-header-text">
                Log in with your email.
            </h1>
            <form onSubmit={handleLogin}>
                <div className="auth-label-input">
                    <label className="auth-label">
                        Email Address
                        <input
                            className="auth-input"
                            type="email"
                            name="email"
                            autoComplete="email"
                            placeholder="name@domain.com"
                            required
                            value={email}
                            onChange={(e) => {
                                const value = e.target.value;
                                setEmail(value);
                                setIsEmailValid(validateEmail(value));
                            }}
                        />
                    </label>
                </div>
                <div className="auth-label-input">
                    <label className="auth-label">
                        Password
                        <PasswordInput 
                            onPasswordChange={setPassword}
                            isLogin={true}
                        />
                    </label>
                </div>
                {errorMessage && <div className="auth-error">
                    {errorMessage}
                </div>}
                
                <button className="auth-submit" type="submit" disabled={!isFormValid}>
                    Log In
                </button>
            </form>
            <div>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </div>
            <div className="auth-bottom-message">Don't have an account?&nbsp;
                <Link className="auth-bottom-message-link" to="/auth/register">Sign up here</Link>.
            </div>
        </div>
    );
};

export default LoginOutlet;