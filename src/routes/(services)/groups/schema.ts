import {z} from 'zod/v4'
import { m } from "$lib/paraglide/messages";


export const createGroupSchema = z.object({
    name:  z.string().min(1, m.group_name_required()).max(100, m.group_name_too_long()),
});

type CreateGroupInput = z.infer<typeof createGroupSchema>;