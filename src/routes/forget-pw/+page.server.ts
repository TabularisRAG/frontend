import type {Actions, PageServerLoad} from "./$types";
import { superValidate } from "sveltekit-superforms";
import { forgetPasswordSchema } from "./schema";
import {zod4} from "sveltekit-superforms/adapters";
import {fail, redirect} from "@sveltejs/kit";
import {AuthenticationAPI} from "$lib/api/AuthenticationAPI";

export const load: PageServerLoad = async (event) => {
    const success = event.url.searchParams.get("success") === "true";
    const error = event.url.searchParams.has("error");
    
    return {
        success,
        error,
        form: await superValidate(zod4(forgetPasswordSchema))
    }
}

export const actions: Actions = {
    default: async (event) => {
        const form = await superValidate(event, zod4(forgetPasswordSchema))
        
        if (!form.valid) {
            return fail(400, { form })
        }

        try {
            const result = await new AuthenticationAPI().resetPassword(
                form.data.email, 
                form.data.newPassword
            );
            
        } catch (error) {
            console.error("Password reset failed:", error);
            
            if (error instanceof Error) {
                if (error.message.includes("User not found")) {
                    form.errors.email = ["User with this email does not exist"];
                } else if (error.message.includes("Default admin")) {
                    form.errors._errors = ["Default admin password cannot be reset"];
                } else {
                    form.errors._errors = ["Password reset failed. Please try again."];
                }
            } else {
                form.errors._errors = ["An unexpected error occurred"];
            }
            
            return fail(400, { form });
        }
        
        redirect(302, `/forget-pw?success=true`)
    }
}