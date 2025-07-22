import type { PageServerLoad } from './$types';
import { User } from "$lib/entities/user";
import ModelAPI from '$lib/api/modelAPI/modelAPI.js';

export const load: PageServerLoad = async ({ locals }) => {
    // const user = new User(locals.user?.id || "", locals.user?.email || "", locals.user?.first_name || "",  locals.user?.last_name || "", locals.user?.is_admin || false)
    const jwt = locals.session?.token;
    const user = locals.user

    
    if (!user) {
        return {
            user: null,
            jwt: null,
            documentsCount: 0,
            chatCount: 0,
            adminData: null
        };
    }
    
    // Base data für alle User
    let result = {
        jwt,
        user,
        documentsCount: 0,
        chatCount: 0,
        adminData: null
    };
    
    // Admin-spezifische Daten laden
    if (user.is_admin && jwt) {
        try {
            const modelAPI = new ModelAPI();
            
            // Parallel laden für bessere Performance
            const [availableModels, availableProviders] = await Promise.all([
                modelAPI.getAvailableModels(jwt),
                modelAPI.getAvailableProviders(jwt)
            ]);
            
            result.adminData = {
                availableModels: Array.isArray(availableModels) ? availableModels : [],
                availableProviders: Array.isArray(availableProviders) ? availableProviders : [],
                isLoading: false
            };
            
        } catch (error) {
            console.error('Error loading admin data in server:', error);
            
            // Fallback: leere Arrays anstatt null, damit Frontend nicht bricht
            result.adminData = {
                availableModels: [],
                availableProviders: [],
                isLoading: false,
                error: 'Failed to load admin data'
            };
        }
    }
    
    return result;
};