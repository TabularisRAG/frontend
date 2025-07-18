import type { UserGroup } from '$lib/entities/groups';
import { error, fail, redirect } from '@sveltejs/kit';

import type {Actions, PageServerLoad} from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from 'sveltekit-superforms/adapters';
import { createGroupSchema } from './schema';
import UserGroupAPI from '$lib/api/usergroupAPI/usergroupAPI';
import { getRequestEvent } from '$app/server';
import { getCurrentUserAndSessionOrRedirct } from '$lib/auth/getUserOrRedirect';
import type { GetAllUserGroupsResponse } from '$lib/api/usergroupAPI/response/GetAllUserGroupsResponse';

export const load: PageServerLoad = async ({ fetch, depends }) => {
  // Add dependency tracking for proper invalidation
  depends('app:usergroups');
  
  const {user, jwt} = getCurrentUserAndSessionOrRedirct()
  console.log("Loading usergroups...")

  try {
    const response: GetAllUserGroupsResponse = await new UserGroupAPI().getUserGroups(jwt);
    return {
      usergroups: response.groups,
      number_of_docs: response.number_of_unique_documents,
      success: true,
      error : null,
      form: await superValidate(zod4(createGroupSchema))
    };
  } catch (e) {    
    return { 
      usergroups: [], 
      success: false,
      number_of_docs: 0,
      error: e, 
      form: await superValidate(zod4(createGroupSchema)) 
    };
  }
};

export const actions: Actions = {
  createGroup: async (request) => {
      const {user, jwt} = getCurrentUserAndSessionOrRedirct()

      const form = await superValidate(request, zod4(createGroupSchema))
      
      if (!form.valid) {
          console.log("Form validation failed:", form.errors);
          return fail(400, { form });
      }

      try {
          await new UserGroupAPI().createUserGroup({ name: form.data.name} as UserGroup, jwt);
          
          // Return success with form data
          return {
              success: true,
              form
          };
          
      } catch (e) {
          console.error("Error creating user group:", e);
          form.errors._errors = ["Fehler beim Erstellen der Gruppe. Bitte versuchen Sie es erneut."];
          return fail(500, { form });
      }
  },
  
  leaveGroup: async ({ request, locals }) => {
    const {user, jwt} = getCurrentUserAndSessionOrRedirct()

    const formData = await request.formData();
    const groupId = formData.get("groupId");
    console.log("Leave group ID:", groupId);

    try {
        const usergroup = await new UserGroupAPI().getUserGroup(groupId as string, jwt);

        if(usergroup.user_count == 1) {
            await new UserGroupAPI().deleteUserGroup(groupId as string, jwt)
        } else {
            await new UserGroupAPI().unassignFromUserGroup(groupId as string, jwt)
        }
        
        return {
            success: true
        };
        
    } catch (e) {
        console.error("Error leaving group:", e);
        return fail(500, { 
            error: "Fehler beim Verlassen der Gruppe. Bitte versuchen Sie es erneut." 
        });
    }
  }
};