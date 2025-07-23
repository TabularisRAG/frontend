import {z} from 'zod/v4'
import {m} from "$lib/paraglide/messages";

export const changePasswordSchema = z.object({
    oldpassword: z.string(),
    newpassword: z.string()
        .min(8, m.password_too_short({length: 8}))
        .regex(new RegExp("[-._!\"`\'#%&,:;<>=@{}~$()*+/\\\\?\\[\\]^|]"), m.password_too_less_special_chars({specialChars: "-._!\"`\'#%&,:;<>=@{}~$()*+/\\?[]^|"}))
        .regex(new RegExp("[0-9]"), m.password_too_less_numbers())
        .regex(new RegExp("[a-z]"), m.password_too_less_lowercase())
        .regex(new RegExp("[A-Z]"), m.password_too_less_uppercase()),
    confirmPassword: z.string(),
}).refine((data) => data.newpassword === data.confirmPassword, {
    message: m.password_not_match(),
    path: ["confirmPassword"]
})