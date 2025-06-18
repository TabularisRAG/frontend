import {z} from 'zod/v4'
import {m} from "$lib/paraglide/messages";

export const loginSchema = z.object({
    email: z.email(m.email_incorrect()),
    password: z.string().nonempty(m.password_empty())
})