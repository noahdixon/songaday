// import React, { createContext, useContext, useState, ReactNode } from 'react';
// import { login as apiLogin, logout as apiLogout, AuthServiceResponse } from '../services/authService';

// interface AuthContextType {
//     isLoggedIn: boolean;
//     login: (email: string, password: string) => Promise<{ success: boolean, error?: string}>;
//     logout: () => void;
// }

// const AuthContext: React.Context<AuthContextType | undefined> = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//     const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('accessToken'));

//     const login = async (email: string, password: string): Promise<{ success: boolean, error?: string}> => {
//         try {
//             const loginResult: AuthServiceResponse = await apiLogin(email, password);
//             if (loginResult.success) {
//                 // Store tokens in sessionStorage
//                 localStorage.setItem('accessToken', loginResult.accessToken!);
//                 setIsLoggedIn(true);
//                 return { success: true };
//             } else {
//                 return { success: false, error: loginResult.error};
//             }
//         } catch (error) {
//             console.error('Login failed', error)
//             return { success: false};
//         }
//     };

//     const logout = async () => {
//         apiLogout();
//         localStorage.removeItem('accessToken');
//         setIsLoggedIn(false);
//     };

//     return (
//         <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = (): AuthContextType => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// };




import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, AuthServiceResponse } from '../services/authService';
import { registerSetIsLoggedIn } from '../services/authStateService';

interface AuthContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
}

const AuthContext: React.Context<AuthContextType | undefined> = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('accessToken'));

    useEffect(() => {
        registerSetIsLoggedIn(setIsLoggedIn);
    }, [setIsLoggedIn])

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};