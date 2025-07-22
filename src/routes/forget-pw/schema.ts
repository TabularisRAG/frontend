import {z} from 'zod/v4'
import {m} from "$lib/paraglide/messages";

export const forgetPasswordSchema = z.object({
    email: z.string().email(m.email_incorrect()),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters long")
        .nonempty(m.password_empty()),
    confirmPassword: z.string()
        .nonempty("Please confirm your password")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});