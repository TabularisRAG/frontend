import {z} from 'zod/v4'
import {m} from "$lib/paraglide/messages";

export const changePasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string()
        .min(8, m.password_too_short({length: 8}))
        .regex(new RegExp("[-._!\"`\'#%&,:;<>=@{}~$()*+/\\\\?\\[\\]^|]"), m.validation_password_special_chars({specialChars: "-._!\"`\'#%&,:;<>=@{}~$()*+/\\?[]^|"}))
        .regex(new RegExp("[0-9]"), m.validation_password_numbers())
        .regex(new RegExp("[a-z]"), m.validation_password_lowercase())
        .regex(new RegExp("[A-Z]"), m.validation_password_uppercase()),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: m.validation_password_not_match(),
    path: ["confirmPassword"]
})