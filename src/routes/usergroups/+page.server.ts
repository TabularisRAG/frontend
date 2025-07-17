import type { UserGroup } from '$lib/entities/groups';
import type { LayoutServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';

import type {Actions, PageServerLoad} from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from 'sveltekit-superforms/adapters';
import { createGroupSchema } from './schema';
import UserGroupAPI from '$lib/api/usergroupAPI/usergroupAPI';
import { getRequestEvent } from '$app/server';
import { getCurrentUserAndSessionOrRedirct } from '$lib/auth/getUserOrRedirect';

export const load: PageServerLoad = async ({ fetch, depends }) => {

  const {user, jwt } = getCurrentUserAndSessionOrRedirct()

  try {
    const list: UserGroup[] = await new UserGroupAPI().getUserGroups(jwt);
    return {
      usergroups: list,
      success: true,
      error : null,
      form: await superValidate(zod4(createGroupSchema))
    };
  } catch (e) {    
    return { 
      usergroups: [], 
      success: false,
      error: e, 
      form: await superValidate(zod4(createGroupSchema)) 
    };
  }
};

export const actions: Actions = {
  default: async (request) => {
    const {locals} = getRequestEvent();

    const jwt = locals.session?.token

    if (!locals.user || !jwt)
        redirect(302, "/login")

      const form = await superValidate(request, zod4(createGroupSchema))
      console.log("Form data:", form.data);
      
      // Validate the form data
      if (!form.valid) {
          console.log("Form validation failed:", form.errors);
          return fail(400, { form });
      }

      try {
          // Create the group using the API
          const userGroupAPI = new UserGroupAPI();
          const result = await userGroupAPI.createUserGroup({ 
              name: form.data.name,
          } as UserGroup, jwt);
          
          console.log("Group created successfully:", result);
          
          // Return success with the form
          return { form };
          
      } catch (e) {
          console.error("Error creating user group:", e);
          
          form.errors._errors = ["Fehler beim Erstellen der Gruppe. Bitte versuchen Sie es erneut."];
          
          return fail(500, { form });
      }
  }
};