import api from "./api";

export const getPosts = async (): Promise<{success: boolean, posts?: any, error?: string}> => {
    try {
        // Attempt get posts
        const response = await api.get('/posts');
        return { success: true, posts: response.data };
    } catch(error: any) {
        return { success: false, error: error.response.data.error };
    }
};