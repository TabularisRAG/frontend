import type { UserGroup } from '$lib/entities/groups';
import type { LayoutServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';

import type {Actions, PageServerLoad} from "./$types";
import { z } from 'zod';
import { superValidate } from "sveltekit-superforms";
import {zod4} from "sveltekit-superforms/adapters";
import { createGroupSchema } from './schema';
import UserGroupAPI from '$lib/api/usergroupAPI/usergroupAPI';

export const load: LayoutServerLoad = async ({ fetch, depends }) => {
  try {
    const list: UserGroup[] = await new UserGroupAPI().getUserGroups()

    return {
      usergroups: list,
      success : true
    };
  } catch (e) {
    console.error("Error while loading usergroup data:", e);
    return { usergroups: [], success : false };
  }
};

const createGroupSchema = z.object({
    name: z.string().min(1, 'Gruppenname ist erforderlich').max(100, 'Gruppenname zu lang'),
});

export const actions: Actions = {
  default: async (event) => {
  
      try {
          await new UserGroupAPI().createUserGroup(event.form.data as unknown as UserGroup)
         
      } catch (e) {
          console.error(e)
      }
  }
}