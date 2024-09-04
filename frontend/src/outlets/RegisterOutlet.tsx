import React, { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import PasswordInput from '../components/PasswordInput';
import PhoneNumberInput from '../components/PhoneNumberInput';
import { register } from '../services/authService';

const RegisterOutlet: React.FC = () => {
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
    const [isPhoneValid, setIsPhoneValid] = useState<boolean>(false);
    const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState<boolean>(false);
    const { validateEmail, validatePhone } = useOutletContext<{ validateEmail: (email: string) => boolean, validatePhone: (phone: string) => boolean}>();
    const navigate = useNavigate();

    const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const registerResult = await register(email, password, phone);
        if (registerResult.success) {
            setErrorMessage("");
            navigate("/auth/login");
            toast.success("Registration successful! Please log in.");
        } else {
            setErrorMessage(registerResult.error!);
        }
    };

    // Form validity check
    const isFormValid = isEmailValid && (!phone || isPhoneValid) && isPasswordValid && isConfirmPasswordValid && password === confirmPassword;

    return (
        <div className="auth-content">
            <h1 className="auth-header-text">
                Sign up for daily song recommendations.
            </h1>

            <form onSubmit={handleRegister}>
                <div className="auth-label-input">
                    <label className="auth-label">
                        Email Address*
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
                        Phone Number (Recommended)
                        <PhoneNumberInput
                            value={phone}
                            onPhoneChange={(newPhone: string) => {
                                setPhone(newPhone);
                                setIsPhoneValid(validatePhone(newPhone));
                            }}
                        />
                    </label>
                </div>
                <div className="auth-label-input">
                    <label className="auth-label">
                        Password*
                        <PasswordInput
                            onPasswordChange={setPassword}
                            onValidityChange={setIsPasswordValid}
                        />
                    </label>
                </div>
                <div className="auth-label-input">
                    <label className="auth-label">
                        Retype Password*
                        <PasswordInput 
                            onValidityChange={setIsConfirmPasswordValid} 
                            onPasswordChange={setConfirmPassword} 
                            isDuplicate={true} 
                            otherPassword={password}
                        />
                    </label>
                </div>
                
                {errorMessage && <div className="auth-error">
                    {errorMessage}
                </div>}
                
                <button className="auth-submit" type="submit" disabled={!isFormValid}>
                    Sign Up
                </button>
            </form>
            <div className="auth-bottom-message">Already have an account?&nbsp;
                <Link className="auth-bottom-message-link"  to="/auth/login">Log in here</Link>.
            </div>
        </div>
    );
};

export default RegisterOutlet;