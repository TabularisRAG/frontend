import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;
    
    if (!user) {
        return {
            user: null,
            documentsCount: 0,
            chatCount: 0,
        };
    }
    
    return {
        user,
        documentsCount: 0,
        chatCount: 0,
    };
};