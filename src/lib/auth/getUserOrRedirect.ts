import { getRequestEvent } from "$app/server";
import { redirect } from "@sveltejs/kit";

export function getCurrentUserAndSessionOrRedirect() {
     const {locals} = getRequestEvent();
    
      const jwt = locals.session?.token
    
      if (!locals.user || !jwt)
          redirect(302, "/login")

      return { user: locals.user, jwt: jwt }
}