import type { LayoutServerLoad } from './$types';
import {getRequestEvent} from "$app/server";
import {redirect} from "@sveltejs/kit";

export const load: LayoutServerLoad = async () => {
    const {locals} = getRequestEvent();

    if (!locals.user) {
        redirect(302, "/login")
    }
    return {
        user: locals.user,
    }
}