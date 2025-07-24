import {z} from 'zod/v4'
import {m} from "$lib/paraglide/messages";

export const registerSchema = z.object({
    email: z.email(m.validation_email_incorrect()),
    firstName: z.string().nonempty(m.validation_first_name_empty()),
    lastName: z.string().nonempty(m.validation_last_name_empty()),
    password: z.string()
        .min(8, m.validation_password_too_short({length: 8}))
        .regex(/[-._!"`'#%&,:;<>=@{}~$()*+/\\?\[\]^|]/, m.validation_password_special_chars({specialChars: "-._!\"`\'#%&,:;<>=@{}~$()*+/\\?[]^|"}))
        .regex(/[0-9]/, m.validation_password_numbers())
        .regex(/[a-z]/, m.validation_password_lowercase())
        .regex(/[A-Z]/, m.validation_password_uppercase()),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: m.validation_password_not_match(),
    path: ["confirmPassword"]
})