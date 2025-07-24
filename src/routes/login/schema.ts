import {z} from 'zod/v4'
import {m} from "$lib/paraglide/messages";

export const loginSchema = z.object({
    email: z.email(m.validation_email_incorrect()),
    password: z.string().nonempty(m.validation_password_empty())
})