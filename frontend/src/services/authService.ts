import api from "./api";

export interface AuthServiceResponse {
    success: boolean, 
    accessToken?: string, 
    error?: string
}

export const register = async (email: string, password: string, phone: string | null): Promise<AuthServiceResponse> => {
    try {
        let data;
        if (phone) {
            data = { email, phone, password }
        } else {
            data = { email, password };
        }
        // Attempt register
        const response = await api.post('/auth/register', data);
        return { success: true }; 
    } catch (error: any) {
        return { success: false, error: error.response.data.error };
    }
}

export const login = async (email: string, password: string): Promise<AuthServiceResponse> => {
    try {
        // Attempt log in
        const response = await api.post('/auth/login', { email, password }, { withCredentials: true });
        localStorage.setItem('accessToken', response.data.accessToken);
        return { success: true }; 
    } catch (error: any) {
        return { success: false, error: error.response.data.error };
    }
};

export const logout = async (): Promise<AuthServiceResponse> => {
    try {
        // Attempt logout
        localStorage.removeItem('accessToken');
        const response = await api.delete('/auth/logout', { withCredentials: true });
        return { success: true }; 
    } catch (error: any) {
        if(!error.response?.data?.error) {
            return { success: false, error: "NETWORK ERROR" }; 
        }
        return { success: false, error: error.response.data.error };
    }
};

export const refreshToken = async (): Promise<AuthServiceResponse> => {
    try {
        // Attempt token refresh
        const response = await api.post('/auth/token', {}, { withCredentials: true });
        return { success: true, accessToken: response.data.accessToken }; 
    } catch (error: any) {
        return { success: false, error: error.response.data.error };
    }
};