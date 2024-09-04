import { AxiosResponse } from "axios";
import { Entity } from '@shared/dtos/Entity';
import api from "./api";

export interface SpotifyServiceResponse {
    success: boolean, 
    data?: any, 
    error?: string
}

export const search = async (query: string, entity: Entity): Promise<SpotifyServiceResponse> => {
    try {
        // Attempt search
        const response: AxiosResponse = await api.post('/search', {query, entity});
        return { success: true, data: response.data }; 

    } catch (error: any) {

        if (error.response?.data?.error) {
            return { success: false, error: error.response.data.error };
        }
        return { success: false, error: "An unexpected Error occurred." }
    }
}