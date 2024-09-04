import { Entity } from '@shared/dtos/Entity';
import { toast } from 'react-toastify';
import api from "./api";

export interface UserServiceResponse {
    success: boolean, 
    error?: string,
    data?: any
}

export const likeContent = async (contentId: string, entity: Entity): Promise<UserServiceResponse> => {
    try {
        // Attempt like
        await api.post('/user/like', {contentId, entity});
        return { success: true }; 
    } catch (error: any) {

        if (error.response?.data?.error) {
            return { success: false, error: error.response.data.error };
        }
        return { success: false, error: "An unexpected error occurred. Could not like content." }
    }
}

export const removeContent = async (contentId: string, entity: Entity): Promise<UserServiceResponse> => {
    try {
        // Attempt remove
        await api.delete(`/user/remove`, { params: { contentId, entity } });
        return { success: true };
    } catch (error: any) {

        if (error.response?.data?.error) {
            return { success: false, error: error.response.data.error };
        }
        return { success: false, error: "An unexpected error occurred. Could not like content." }
    }
}

export const getContent = async (): Promise<UserServiceResponse>  => {
    try {
        // Attempt get content
        const response = await api.get('/user/content');
        return { success: true, data: response.data };
    } catch (error: any) {

        if (error.response?.data?.error) {
            return { success: false, error: error.response.data.error };
        }
        return { success: false, error: "An unexpected error occurred. Could not load user content." }
    }
}

export const getDeliverySettings = async (): Promise<UserServiceResponse>  => {
    try {
        // Attempt get settings
        const response = await api.get('/user/delivery-settings');
        console.log(response.data);
        return { success: true, data: response.data };
    } catch (error: any) {

        if (error.response?.data?.error) {
            return { success: false, error: error.response.data.error };
        }
        return { success: false, error: "An unexpected error occurred. Could not load user content." }
    }
}

export const updateDeliverySetting = async (setting: string, value: string | boolean): Promise<UserServiceResponse>  => {
    try {
        // Attempt update
        const response = await api.put('/user/delivery-settings', { setting, value });
        toast.success("Recommendation settings updated.");
        return { success: true };
    } catch (error: any) {

        toast.error("An error occured. Recommendation settings not updated.");
        if (error.response?.data?.error) {
            return { success: false, error: error.response.data.error };
        }
        return { success: false, error: "An unexpected error occurred. Could not load user content." }
    }
}