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
        await api.post('/auth/register', data);

        return { success: true }; 
    } catch (error: any) {
        return { success: false, error: error.response.data.error };
    }
}

export const login = async (email: string, password: string): Promise<AuthServiceResponse> => {
    try {
        // Attempt log in
        const response: any = await api.post('/auth/login', { email, password }, { withCredentials: true });

        // Check that access token was returned
        if (!response.data?.accessToken) {
            return { success: false, error: "Server did not return an access token." };
        }

        localStorage.setItem('accessToken', response.data?.accessToken);
        return { success: true }; 
    } catch (error: any) {
        return { success: false, error: error.response.data.error };
    }
};

export const logout = async (): Promise<AuthServiceResponse> => {
    try {
        // Attempt logout
        localStorage.removeItem('accessToken');
        await api.delete('/auth/logout', { withCredentials: true });

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
        const response: any = await api.post('/auth/token', {}, { withCredentials: true });

        // Check that access token was returned
        if (!response.data?.accessToken) {
            return { success: false, error: "Server did not return an access token." };
        }

        return { success: true, accessToken: response.data.accessToken }; 
    } catch (error: any) {
        return { success: false, error: error.response.data.error };
    }
};