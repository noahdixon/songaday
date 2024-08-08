import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface AuthFormProps {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    buttonText: string;
    errorMessage: string;
    otherFormLink: string;
    otherFormMessage: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSubmit, buttonText, errorMessage, otherFormLink, otherFormMessage }) => {
    return (
        <div>
            <form onSubmit={onSubmit}>
                <div>
                    <label>Email
                        <input type="email" name="email" autoComplete="email" required/>
                    </label>
                </div>
                <div>
                    <label>Phone Number
                        <input type="phone" name="phone" autoComplete="phone"/>
                    </label>
                </div>
                <div>
                    <label>Password
                        <input type="password"
                            name="password"
                            required
                            pattern="^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,32}$).*$"
                            title="Password must be 8-32 characters long, contain at least one uppercase letter, and one special character."/>
                    </label>
                </div>
                <button type="submit">{buttonText}</button>
            </form>
            <div>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </div>
            <div>
            <Link to={otherFormLink}>{otherFormMessage}</Link>
            </div>
        </div>
    );
};

export default AuthForm;