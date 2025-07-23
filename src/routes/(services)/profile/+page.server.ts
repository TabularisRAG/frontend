import type { PageServerLoad, Actions } from './$types';
import type { AdminData } from "$lib/entities/adminData";
import { superValidate } from "sveltekit-superforms";
import { changePasswordSchema } from "./schema";
import { zod4 } from "sveltekit-superforms/adapters";
import { fail, redirect } from "@sveltejs/kit";
import { AuthenticationAPI } from "$lib/api/AuthenticationAPI";
import {m} from "$lib/paraglide/messages";
import type { UserResponse  } from '$lib/entities/user';
import ModelAPI from '$lib/api/modelAPI/modelAPI.js';


function getCurrentUserAndJwt(locals: App.Locals) {
  const jwt = locals.session?.token;
  const user = locals.user;
  if (!user || !jwt) {
      redirect(302, "/login");
  }
  return { user, jwt };
}

export const load: PageServerLoad = async ({ locals }) => {

  const {user, jwt } = getCurrentUserAndJwt(locals);

  let adminData: AdminData = {
    availableModels: [],
    availableProviders: [],
    isLoading: false
  };

  let inactive_users: UserResponse[] = [];

  if (user?.is_admin && jwt) {
    try {
      const modelAPI = new ModelAPI();
      const [availableModels, availableProviders] = await Promise.all([
        modelAPI.getAvailableModels(jwt),
        modelAPI.getAvailableProviders(jwt)
      ]);

      adminData = {
        availableModels: Array.isArray(availableModels) ? availableModels : [],
        availableProviders: Array.isArray(availableProviders) ? availableProviders : [],
        isLoading: false
      };

      const authAPI = new AuthenticationAPI();
      const response =  await authAPI.getUsersInactive(jwt);
      inactive_users = response.inactive_users;
      
    } catch (error) {
      console.error('Error loading admin data in server:', error);
    }
  }

  return {
    jwt,
    user,
    adminData,
    inactive_users,
    form: await superValidate(zod4(changePasswordSchema))
  };

};

export const actions: Actions = {
  changePassword: async (event) => {
    const form = await superValidate(event, zod4(changePasswordSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    try {
      await new AuthenticationAPI().changePassword(form.data.newpassword, event, form.data.oldpassword)
      return {
        form,
        success: true,
        message: m.password_changed_successfully()
      }

    } catch (e) {
      console.error(e)

      if (e instanceof Error) {
          let message = "";
          switch (e.message) {
            case "Default admin password cannot be changed":
              message = m.default_admin_password_change_not_allowed()
              break;
            case "Authentication failed. Check your old password":
              message = m.incorrect_current_password()
              break;
            default:
              message = m.password_change_error();
          }

        return fail(400, {
          form,
          message: message
        })
      }
    }

  },
  activateUser: async (event) => {
    const formData = await event.request.formData();
    const userId = formData.get('userId') as string;
    const userEmail = formData.get('userEmail') as string;

    if (!userId) {
      return fail(400, {
        success: false,
        message: m.user_id_required()
      });
    }

    try {
      const authAPI = new AuthenticationAPI();
      await authAPI.activateUser(userEmail, event);
      
      return {
        success: true,
        message: m.user_activated_successfully({ email: userEmail })
      };
    } catch (e) {
      console.error(`Error activating user ${userEmail}:`, e);
      
      return fail(400, {
        success: false,
        message: m.user_activation_failed()
      });
    }
  }
}