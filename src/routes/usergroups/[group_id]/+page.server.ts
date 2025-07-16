import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod, zod4 } from 'sveltekit-superforms/adapters';
import { addMemberSchema } from './schema';
import { fail, error } from '@sveltejs/kit';
import UserGroupAPI from '$lib/api/usergroupAPI/usergroupAPI';
import type { UserGroup } from '$lib/entities/groups';
import { AuthenticationAPI } from '$lib/api/AuthenticationAPI';
import type { User } from '$lib/entities/user';
import UserAPI from '$lib/api/userAPI/userAPI';

export const load: PageServerLoad = async ({ params, locals, url }) => {
    const groupId = params.group_id;
    
    if (!groupId) {
        throw error(404, 'Gruppe nicht gefunden');
    }
    
    const usergroup = await new UserGroupAPI().getUserGroup(groupId)
    let current_user = locals.user
    current_user = { id : "bd38a05b-d454-4764-bd31-6c97e96b2ee5"} as User
   
    const allUsers = await new UserAPI().getAllUsers()

    return {
        group : usergroup,
        allUsers : allUsers,
        current_user : current_user,
        add_member_form: await superValidate(zod4(addMemberSchema)),
        success: true
    }
};

export const actions: Actions = {
    addMember: async ({ request, params, locals }) => {
        const groupId = params.group_id;
        const form = await superValidate(request, zod4(addMemberSchema));
        
        if (!form.valid) {
            return fail(400, { form });
        }
        
        try {            
            console.log(`Nutzer ${form.data.email} zur Gruppe ${groupId} hinzugefügt`);
            
            return { form };
        } catch (error) {
            console.error('Fehler beim Hinzufügen des Mitglieds:', error);
            return fail(500, { form, error: 'Fehler beim Hinzufügen des Mitglieds' });
        }
    },
    
    removeMember: async ({ request, params, locals }) => {
        const groupId = params.group_id;
        const formData = await request.formData();
        const memberIdToRemove = formData.get('memberId') as string;
        
        try {
            // Prüfen ob der aktuelle Nutzer Admin der Gruppe ist
            // const isAdmin = await isGroupAdmin(groupId, locals.user.id);
            // if (!isAdmin) {
            //     return fail(403, { error: 'Keine Berechtigung' });
            // }
            
            // Nutzer aus der Gruppe entfernen
            // await removeUserFromGroup(groupId, memberIdToRemove);
            
            console.log(`Nutzer ${memberIdToRemove} aus Gruppe ${groupId} entfernt`);
            
            return { success: true };
        } catch (error) {
            console.error('Fehler beim Entfernen des Mitglieds:', error);
            return fail(500, { error: 'Fehler beim Entfernen des Mitglieds' });
        }
    },
    
    leaveGroup: async ({ params, locals }) => {
        const groupId = params.group_id;
        
        try {
            // Nutzer aus der Gruppe entfernen
            // await removeUserFromGroup(groupId, locals.user.id);
            
            console.log(`Nutzer ${locals.user.id} hat Gruppe ${groupId} verlassen`);
            
            return { success: true };
        } catch (error) {
            console.error('Fehler beim Verlassen der Gruppe:', error);
            return fail(500, { error: 'Fehler beim Verlassen der Gruppe' });
        }
    },
    
    toggleAdmin: async ({ request, params, locals }) => {
        const groupId = params.groupId;
        const formData = await request.formData();
        const memberId = formData.get('memberId') as string;
        const makeAdmin = formData.get('makeAdmin') === 'true';
        
        try {
            // Prüfen ob der aktuelle Nutzer Admin der Gruppe ist
            // const isAdmin = await isGroupAdmin(groupId, locals.user.id);
            // if (!isAdmin) {
            //     return fail(403, { error: 'Keine Berechtigung' });
            // }
            
            // Admin-Status ändern
            // await updateGroupMemberRole(groupId, memberId, makeAdmin);
            
            console.log(`Admin-Status für Nutzer ${memberId} in Gruppe ${groupId} geändert: ${makeAdmin}`);
            
            return { success: true };
        } catch (error) {
            console.error('Fehler beim Ändern des Admin-Status:', error);
            return fail(500, { error: 'Fehler beim Ändern des Admin-Status' });
        }
    }
};