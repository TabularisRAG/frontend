import { fail } from '@sveltejs/kit';

import type {Actions, PageServerLoad} from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from 'sveltekit-superforms/adapters';
import {m} from "$lib/paraglide/messages";
import UserGroupAPI from '$lib/api/usergroupAPI/usergroupAPI';
import { getCurrentUserAndSessionOrRedirect } from '$lib/auth/getUserOrRedirect';
import type { GetAllUserGroupsResponse, UserGroupDTO } from '$lib/api/usergroupAPI/response/GetAllUserGroupsResponse';
import { createGroupSchema } from './schema';

export const load: PageServerLoad = async ({ fetch, depends }) => {  
  depends('app:groups');
  const {user, jwt} = getCurrentUserAndSessionOrRedirect()

  try {
    const api = new UserGroupAPI()
    console.log("server :" + api.serverURL)
    const response: GetAllUserGroupsResponse = await new UserGroupAPI().getUserGroups(jwt);
    return {
      usergroups: response.groups,
      number_of_docs: response.number_of_unique_documents,
      success: true,
      currentUser : user,
      form: await superValidate(zod4(createGroupSchema))
    };
  } catch (e) {    
    return { 
      usergroups: [], 
      success: false,
      number_of_docs: 0,
      currentUser : user,
      form: await superValidate(zod4(createGroupSchema)) 
    };
  }
};

export const actions: Actions = {
  createGroup: async (request) => {
      const {user, jwt} = getCurrentUserAndSessionOrRedirect()

      const form = await superValidate(request, zod4(createGroupSchema))
      
      if (!form.valid) {
          return fail(400, { form });
      }

      try {
          await new UserGroupAPI().createUserGroup({ name: form.data.name} as UserGroupDTO, jwt);
          
          return {
              success: true,
              form
          };
          
      } catch (e) {
          form.errors._errors = [m.error_while_creating_group()];
          return fail(500, { form });
      }
  },
  
  leaveOrDeleteGroup: async ({ request, locals }) => {
    const {user, jwt} = getCurrentUserAndSessionOrRedirect()

    const formData = await request.formData();
    const groupId = formData.get("groupId");

    try {
        const usergroup = await new UserGroupAPI().getUserGroup(groupId as string, jwt);

        const isAdminAndNotInGroup = user.is_admin && !usergroup.current_user_is_in_group
        const isLastMemberInGroup = usergroup.user_count == 1 && usergroup.current_user_is_in_group
        const isLastLeaderAndOthersAreOnlyMembers = usergroup.current_user_is_leader && usergroup.leader_count == 1

        const shouldDelete =  isAdminAndNotInGroup || isLastMemberInGroup || isLastLeaderAndOthersAreOnlyMembers

        if(shouldDelete) {
            await new UserGroupAPI().deleteGroup(groupId as string, jwt)
        } else {
            await new UserGroupAPI().removeMemberFromGroup(groupId as string, user.id, jwt)
        }
        
        return {
            success: true
        };
        
    } catch (e) {
        return fail(500, { 
            error: m.error_while_leaving_or_deleting_group()
        });
    }
  }
};