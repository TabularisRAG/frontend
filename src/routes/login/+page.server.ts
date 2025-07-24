import type {Actions, PageServerLoad} from "./$types";
import { superValidate } from "sveltekit-superforms";
import { loginSchema } from "./schema";
import {zod4} from "sveltekit-superforms/adapters";
import {fail, redirect} from "@sveltejs/kit";
import {AuthenticationAPI} from "$lib/api/AuthenticationAPI";
import type {LoginUser} from "$lib/entities/user";

export const load: PageServerLoad = async (event) => {
    return {
        logout: event.url.searchParams.has("logout"),
        error: event.url.searchParams.has("error"),
        form: await superValidate(zod4(loginSchema))
    }
}

export const actions: Actions = {
    default: async (event) => {
      const form = await superValidate(event, zod4(loginSchema))
      if (!form.valid) {
        return fail(400, { form })
      }
      
      try {
        await new AuthenticationAPI().login(form.data as unknown as LoginUser, event)
        // Login successful - redirect OUTSIDE of try-catch
      } catch (e) {
        console.error(e)
        // Return failure for actual login errors
        return fail(401, {
          form,
          message: 'Invalid email or password. Please try again.'
        })
      }
      
      // Only reach here if login was successful
      redirect(302, `/chat`)
    }
  }