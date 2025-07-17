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

  const {user, jwt} = getCurrentUserAndSessionOrRedirct()

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
    const {user, jwt} = getCurrentUserAndSessionOrRedirct()

      const form = await superValidate(request, zod4(createGroupSchema))
      
      if (!form.valid) {
          console.log("Form validation failed:", form.errors);
          return fail(400, { form });
      }

      try {
          await new UserGroupAPI().createUserGroup({ name: form.data.name} as UserGroup, jwt);
          throw redirect(303, '?success=1');
          
      } catch (e) {
          console.error("Error creating user group:", e);
          
          form.errors._errors = ["Fehler beim Erstellen der Gruppe. Bitte versuchen Sie es erneut."];
          
          return fail(500, { form });
      }
  }
};