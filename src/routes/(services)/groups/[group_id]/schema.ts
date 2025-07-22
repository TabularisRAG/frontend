import { z } from 'zod/v4';
import { m } from "$lib/paraglide/messages";


export const addMemberSchema = z.object({
    email: z.string().email(m.valid_email_address_required())
});

export const changeGroupNameSchema = z.object({
    name: z.string().min(1, m.group_name_required()).max(100, m.group_name_too_long()),
});

export type AddMemberSchema = typeof addMemberSchema;
export type ChangeGroupNameSchema = typeof changeGroupNameSchema;