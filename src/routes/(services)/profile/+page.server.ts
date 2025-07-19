import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;
    const jwt = locals.session?.token;
    
    if (!user) {
        return {
            user: null,
            documentsCount: 0,
            chatCount: 0,
        };
    }
    
    return {
        jwt,
        user,
        documentsCount: 0,
        chatCount: 0,
    };
};