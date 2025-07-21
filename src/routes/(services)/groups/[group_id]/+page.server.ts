// +page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { addMemberSchema, changeGroupNameSchema } from './schema';
import { fail, error, redirect } from '@sveltejs/kit';
import UserGroupAPI from '$lib/api/usergroupAPI/usergroupAPI';
import UserAPI from '$lib/api/userAPI/userAPI';
import type { User } from '$lib/entities/user';

// Helper to get current user and JWT
function getCurrentUserAndJwt(locals: App.Locals) {
    const jwt = locals.session?.token;
    const user = locals.user;
    if (!user || !jwt) {
        redirect(302, "/login");
    }
    return { user, jwt };
}

// Helper to check if current user is admin of the group or global admin
async function checkUserPermissions(groupId: string, currentUser: User, jwt: string): Promise<{ isAdmin: boolean, isLeader: boolean }> {
    const userGroupAPI = new UserGroupAPI();
    const group = await userGroupAPI.getUserGroup(groupId, jwt);
    const isLeader = group.assignments?.some(ua => ua.user.id === currentUser.id && ua.is_leader) || false;
    const isAdmin = currentUser.is_admin ?? false;
    return { isAdmin, isLeader };
}

export const load: PageServerLoad = async ({ params, locals }) => {
    const groupId = params.group_id;

    if (!groupId) {
        throw error(404, 'Gruppe nicht gefunden');
    }

    const { user: currentUser, jwt } = getCurrentUserAndJwt(locals);

    try {
        const userGroupAPI = new UserGroupAPI();
        const group = await userGroupAPI.getUserGroup(groupId, jwt);
        const allUsers = await new UserAPI().getAllUsers();

        return {
            group: group,
            allUsers: allUsers,
            current_user: currentUser,
            add_member_form: await superValidate(zod4(addMemberSchema)),
            change_group_name_form: await superValidate(zod4(changeGroupNameSchema)),
            success: true
        }
    } catch (e: any) {
        console.error("Error loading group details:", e);
        if (e.status === 404) {
            throw error(404, 'Gruppe nicht gefunden');
        } else if (e.status === 403) {
            throw error(403, 'Zugriff verweigert');
        }
        throw error(500, `Fehler beim Laden der Gruppe: ${e.message || 'Unbekannter Fehler'}`);
    }
};

export const actions: Actions = {
    addMember: async ({ request, params, locals }) => {
        const groupId = params.group_id;
        if (!groupId) {
            return fail(400, { message: 'Gruppen-ID fehlt.' });
        }

        const { user: currentUser, jwt } = getCurrentUserAndJwt(locals);
        const { isAdmin, isLeader } = await checkUserPermissions(groupId, currentUser, jwt);

        if (!isAdmin && !isLeader) {
            return fail(403, { message: 'Keine Berechtigung, Mitglieder hinzuzufügen.' });
        }

        const form = await superValidate(request, zod4(addMemberSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        try {
            const userAPI = new UserAPI();
            const allUsers = await userAPI.getAllUsers();
            const targetUser = allUsers.find(u => u.email === form.data.email);
            
            if (!targetUser) {
                form.errors._errors = ['Benutzer nicht gefunden.'];
                return fail(404, { form, error: 'Benutzer nicht gefunden' });
            }

            const userGroupAPI = new UserGroupAPI();
            await userGroupAPI.addMemberToGroup(groupId, targetUser.id, false, jwt);

            return { form, success: true, message: 'Mitglied erfolgreich hinzugefügt' };
        } catch (e: any) {
            console.error('Fehler beim Hinzufügen des Mitglieds:', e);
            form.errors._errors = [e.message || 'Fehler beim Hinzufügen des Mitglieds.'];
            return fail(500, { form, error: 'Fehler beim Hinzufügen des Mitglieds' });
        }
    },

    removeMember: async ({ request, params, locals }) => {
        const groupId = params.group_id;
        if (!groupId) {
            return fail(400, { message: 'Gruppen-ID fehlt.' });
        }

        const { user: currentUser, jwt } = getCurrentUserAndJwt(locals);
        const { isAdmin, isLeader } = await checkUserPermissions(groupId, currentUser, jwt);

        if (!isAdmin && !isLeader) {
            return fail(403, { message: 'Keine Berechtigung, Mitglieder zu entfernen.' });
        }

        const formData = await request.formData();
        const memberIdToRemove = formData.get('memberId') as string;

        if (!memberIdToRemove) {
            return fail(400, { message: 'Mitglieder-ID fehlt.' });
        }

        if (memberIdToRemove === currentUser.id) {
            return fail(400, { message: 'Sie können sich nicht selbst aus der Gruppe entfernen. Nutzen Sie "Gruppe verlassen" dafür.' });
        }

        try {
            const userGroupAPI = new UserGroupAPI();
            await userGroupAPI.removeMemberFromGroup(groupId, memberIdToRemove, jwt);

            return { success: true, message: 'Mitglied erfolgreich entfernt' };
        } catch (e: any) {
            console.error('Fehler beim Entfernen des Mitglieds:', e);
            return fail(500, { error: e.message || 'Fehler beim Entfernen des Mitglieds' });
        }
    },

    leaveGroup: async ({ params, locals }) => {
        const groupId = params.group_id;
        if (!groupId) {
            return fail(400, { message: 'Gruppen-ID fehlt.' });
        }

        const { user: currentUser, jwt } = getCurrentUserAndJwt(locals);

        try {
            const userGroupAPI = new UserGroupAPI();
            await userGroupAPI.removeMemberFromGroup(groupId, currentUser.id, jwt);
            
            throw redirect(302, '/groups'); // Korrekte Route
        } catch (e: any) {
            if (e.status === 302) {
                throw e;
            }
            console.error('Fehler beim Verlassen der Gruppe:', e);
            return fail(500, { error: e.message || 'Fehler beim Verlassen der Gruppe' });
        }
    },

    toggleLeader: async ({ request, params, locals }) => {
        const groupId = params.group_id;
        if (!groupId) {
            return fail(400, { message: 'Gruppen-ID fehlt.' });
        }

        const { user: currentUser, jwt } = getCurrentUserAndJwt(locals);
        const { isAdmin, isLeader } = await checkUserPermissions(groupId, currentUser, jwt);

        if (!isAdmin && !isLeader) {
            return fail(403, { message: 'Keine Berechtigung, Leader-Rollen zu ändern.' });
        }

        const formData = await request.formData();
        const memberId = formData.get('memberId') as string;
        const makeLeader = formData.get('makeLeader') === 'true';

        if (!memberId) {
            return fail(400, { message: 'Mitglieder-ID fehlt.' });
        }

        if (memberId === currentUser.id && !makeLeader && !isAdmin) {
            return fail(400, { message: 'Sie können sich nicht selbst die Leader-Rolle entziehen, es sei denn, Sie sind ein globaler Administrator.' });
        }

        try {
            const userGroupAPI = new UserGroupAPI();
            await userGroupAPI.updateMemberLeaderStatus(groupId, memberId, makeLeader, jwt);

            return { success: true, message: makeLeader ? 'Benutzer wurde zum Leader befördert' : 'Leader-Rolle wurde entzogen' };
        } catch (e: any) {
            console.error('Fehler beim Ändern der Leader-Rolle:', e);
            return fail(500, { error: e.message || 'Fehler beim Ändern der Leader-Rolle' });
        }
    },

    changeGroupName: async ({ request, params, locals }) => {
        const groupId = params.group_id;
        if (!groupId) {
            return fail(400, { message: 'Gruppen-ID fehlt.' });
        }

        const { user: currentUser, jwt } = getCurrentUserAndJwt(locals);
        const { isAdmin, isLeader } = await checkUserPermissions(groupId, currentUser, jwt);

        if (!isAdmin && !isLeader) {
            return fail(403, { message: 'Keine Berechtigung, den Gruppennamen zu ändern.' });
        }

        const form = await superValidate(request, zod4(changeGroupNameSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        try {
            const userGroupAPI = new UserGroupAPI();
            const updatedGroup = await userGroupAPI.updateGroupName(groupId, form.data.name, jwt);

            return { form, success: true, updatedGroup, message: 'Gruppenname erfolgreich geändert' };
        } catch (e: any) {
            console.error('Fehler beim Ändern des Gruppennamens:', e);
            form.errors._errors = [e.message || 'Fehler beim Ändern des Gruppennamens.'];
            return fail(500, { form, error: 'Fehler beim Ändern des Gruppennamens' });
        }
    },

    deleteGroup: async ({ params, locals }) => {
        const groupId = params.group_id;
        if (!groupId) {
            return fail(400, { message: 'Gruppen-ID fehlt.' });
        }

        const { user: currentUser, jwt } = getCurrentUserAndJwt(locals);
        const { isAdmin, isLeader } = await checkUserPermissions(groupId, currentUser, jwt);

        if (!isAdmin && !isLeader) {
            return fail(403, { message: 'Keine Berechtigung, die Gruppe zu löschen.' });
        }

        try {
            const userGroupAPI = new UserGroupAPI();
            await userGroupAPI.deleteGroup(groupId, jwt);

            throw redirect(302, '/groups'); // Korrekte Route
        } catch (e: any) {
            if (e.status === 302) {
                throw e;
            }
            console.error('Fehler beim Löschen der Gruppe:', e);
            return fail(500, { error: e.message || 'Fehler beim Löschen der Gruppe' });
        }
    },
};