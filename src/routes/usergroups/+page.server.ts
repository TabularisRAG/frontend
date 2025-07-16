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
    const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG4yLnNtaXRoQGV4YW1wbGUuY29tIiwiZXhwIjoxNzUyNjY0MDc4fQ.JKuaVv5LKJEQN_Rp69Cr6YUuy5GgwkIM0bLXKDqqnW8"
    const res = await fetch("http://localhost:8000/api/groups", {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    if (!res.ok) {
      throw error(res.status, "User groups could not be loaded");
    }

    const list: UserGroup[] = await res.json();

    console.log(list)

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
    console.log("page server called")
    //const form = await superValidate(event, createGroupSchema)
    console.log("validated")

     //if (!form.valid) {
      //    return fail(400, { form})
      //}
      try {
          await new UserGroupAPI().createUserGroup(event.form.data as unknown as UserGroup)
          redirect(302, `/documents`)
      } catch (e) {
          console.error(e)
          redirect(302, `/documents`)
      }
  }
}