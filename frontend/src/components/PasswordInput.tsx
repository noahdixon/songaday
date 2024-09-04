import React, { useState, useEffect } from 'react';
import "./PasswordInput.css";

interface PasswordInputProps {
    onPasswordChange: (password: string) => void;
    onValidityChange?: (isValid: boolean) => void;
    isDuplicate?: boolean;
    isLogin?: boolean;
    otherPassword?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ onPasswordChange, onValidityChange, isDuplicate=false, isLogin=false, otherPassword }) => {
    const [password, setPassword] = useState<string>('');
    const [isValid, setIsValid] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    useEffect(() => {
        onPasswordChange(password);
    }, [password, onPasswordChange]);

    const validatePassword = (password: string): boolean => {
        if (isDuplicate) {
            // If isDuplicate is true, check if passwords match
            return password === otherPassword;
        } else {
            // Regular validation
            const isLengthValid = password.length >= 8 && password.length <= 32;
            const hasUppercase = /[A-Z]/.test(password);
            const hasSpecialChar = /[!@#$%^&*]/.test(password);

            return isLengthValid && hasUppercase && hasSpecialChar;
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);

        const validity = validatePassword(newPassword);
        setIsValid(validity);
        onValidityChange?.(validity);
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="password-input-container">
            <input
                className="auth-input password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                placeholder="••••••••"
                onChange={handlePasswordChange}
            />
            <img
                className="password-eye"
                src={showPassword ? '/eye-pink.png' : '/eye-grey.png'}
                alt="Toggle password visibility"
                onClick={toggleShowPassword}
            />
            {!isLogin && !isValid && password && (
                <div className="password-requirements">
                    {isDuplicate ? (
                        <>Passwords must match</>
                    ) : (
                        <>
                            Password must:
                            <ul>
                                <li>be 8-32 characters long</li>
                                <li>contain at least one uppercase letter</li>
                                <li>contain at least one special character</li>
                            </ul>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default PasswordInput;