import type { PageServerLoad } from './$types';
import type { AdminData } from "$lib/entities/adminData";
import ModelAPI from '$lib/api/modelAPI/modelAPI.js';

export const load: PageServerLoad = async ({ locals }) => {
    const jwt = locals.session?.token;
    const user = locals.user;

    let adminData: AdminData = {
        availableModels: [],
        availableProviders: [],
        isLoading: false
    };

    if (user?.is_admin && jwt) {
        try {
            const modelAPI = new ModelAPI();

            const [availableModels, availableProviders] = await Promise.all([
                modelAPI.getAvailableModels(jwt),
                modelAPI.getAvailableProviders(jwt)
            ]);

            adminData = {
                availableModels: Array.isArray(availableModels) ? availableModels : [],
                availableProviders: Array.isArray(availableProviders) ? availableProviders : [],
                isLoading: false
            };
        } catch (error) {
            console.error('Error loading admin data in server:', error);
        }
    }

    return {
        jwt,
        user,
        adminData
    };
};
