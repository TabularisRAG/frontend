import type { UserGroup } from '$lib/entities/groups';
import type { LayoutServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';

import type {Actions, PageServerLoad} from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from 'sveltekit-superforms/adapters';
import { createGroupSchema } from './schema';
import UserGroupAPI from '$lib/api/usergroupAPI/usergroupAPI';

export const load: PageServerLoad = async ({ fetch, depends }) => {

  try {
    const list: UserGroup[] = await new UserGroupAPI().getUserGroups();
    console.log(list)
    return {
      usergroups: list,
      success: true,
      form: await superValidate(zod4(createGroupSchema))
    };
  } catch (e) {
    console.error("Error while loading usergroup data:", e);
    
    return { 
      usergroups: [], 
      success: false, 
      form: await superValidate(zod4(createGroupSchema)) 
    };
  }
};

export const actions: Actions = {
  default: async (request) => {
      console.log("Creating group");
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
              name: form.data.name 
          } as UserGroup);
          
          console.log("Group created successfully:", result);
          
          // Return success with the form
          return { form };
          
      } catch (e) {
          console.error("Error creating user group:", e);
          
          // Set form-level error
          form.errors._errors = ["Fehler beim Erstellen der Gruppe. Bitte versuchen Sie es erneut."];
          
          return fail(500, { form });
      }
  }
};