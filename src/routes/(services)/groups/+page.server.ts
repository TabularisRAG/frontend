import type { UserGroup } from '$lib/entities/groups';
import { fail } from '@sveltejs/kit';

import type {Actions, PageServerLoad} from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from 'sveltekit-superforms/adapters';
import {m} from "$lib/paraglide/messages";
import UserGroupAPI from '$lib/api/usergroupAPI/usergroupAPI';
import { getCurrentUserAndSessionOrRedirct } from '$lib/auth/getUserOrRedirect';
import type { GetAllUserGroupsResponse } from '$lib/api/usergroupAPI/response/GetAllUserGroupsResponse';
import { createGroupSchema } from './schema';

export const load: PageServerLoad = async ({ fetch, depends }) => {  
  depends('app:groups');
  const {user, jwt} = getCurrentUserAndSessionOrRedirct()

  try {
    const response: GetAllUserGroupsResponse = await new UserGroupAPI().getUserGroups(jwt);
    return {
      usergroups: response.groups,
      number_of_docs: response.number_of_unique_documents,
      success: true,
      form: await superValidate(zod4(createGroupSchema))
    };
  } catch (e) {    
    return { 
      usergroups: [], 
      success: false,
      number_of_docs: 0,
      form: await superValidate(zod4(createGroupSchema)) 
    };
  }
};

export const actions: Actions = {
  createGroup: async (request) => {
      const {user, jwt} = getCurrentUserAndSessionOrRedirct()

      const form = await superValidate(request, zod4(createGroupSchema))
      
      if (!form.valid) {
          return fail(400, { form });
      }

      try {
          await new UserGroupAPI().createUserGroup({ name: form.data.name} as UserGroup, jwt);
          
          return {
              success: true,
              form
          };
          
      } catch (e) {
          form.errors._errors = [m.error_while_creating_group()];
          return fail(500, { form });
      }
  },
  
  leaveGroup: async ({ request, locals }) => {
    const {user, jwt} = getCurrentUserAndSessionOrRedirct()

    const formData = await request.formData();
    const groupId = formData.get("groupId");

    try {
        const usergroup = await new UserGroupAPI().getUserGroup(groupId as string, jwt);

        if(usergroup.user_count == 1) {
            await new UserGroupAPI().deleteGroup(groupId as string, jwt)
        } else {
            await new UserGroupAPI().removeMemberFromGroup(groupId as string, user.id, jwt)
        }
        
        return {
            success: true
        };
        
    } catch (e) {
        return fail(500, { 
            error: m.error_while_leaving_group()
        });
    }
  }
};