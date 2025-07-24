import {redirect} from "@sveltejs/kit";
import type {Actions} from "./$types";
import {AuthenticationAPI} from "$lib/api/AuthenticationAPI";

export const actions: Actions = {
    default: async (event) => {
        try {
            await new AuthenticationAPI().logout(event)
            redirect(302, `/login?logout`)
        } catch (e) {
            console.error(e)
            redirect(302, `/login?logout`)
        }


    }
}