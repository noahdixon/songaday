import { Outlet } from "react-router-dom";
import "./AuthPage.css"

const AuthPage: React.FC = () => { 

    // Email validation function
    const validateEmail = (email: string) => {
        return email.includes('@');
    };

    // Phone validation function
    const validatePhone = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length === 10;
    };

    return(
        <div className="app-container">
            <div className="auth-flex-container">
                <div className="auth-container">
                    <img src="/songaday-logo.png" alt="Songaday Logo" className="auth-logo" />
                    <Outlet context={{ validateEmail, validatePhone }}/>
                </div>
            </div>
        </div>
    );   
}

export default AuthPage;