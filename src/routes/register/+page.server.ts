import type {Actions, PageServerLoad} from "./$types";
import { superValidate } from "sveltekit-superforms";
import { registerSchema } from "./schema";
import {zod4} from "sveltekit-superforms/adapters";
import {fail, redirect} from "@sveltejs/kit";
import {AuthenticationAPI} from "$lib/api/AuthenticationAPI";
import {RegistrationUser} from "$lib/entities/user";

export const load: PageServerLoad = async (event) => {
    return {
        form: await superValidate(zod4(registerSchema))
    }
}

export const actions: Actions = {
    default: async (event) => {
      const form = await superValidate(event, zod4(registerSchema))
      if (!form.valid) {
        return fail(400, { form })
      }
      
      try {
        await new AuthenticationAPI().registerUser(form.data as unknown as RegistrationUser)
      } catch (e) {
        console.error(e)
        return fail(400, {
          form,
          message: 'Registration failed. Please try again.'
        })
      }
      
      redirect(302, `/login?registered=true`)
    }
  }