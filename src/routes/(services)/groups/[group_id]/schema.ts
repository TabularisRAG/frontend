import { z } from 'zod/v4';

export const createGroupSchema = z.object({
    name: z.string().min(3, 'Gruppenname ist erforderlich').max(100, 'Gruppenname zu lang'),
    description: z.string().max(500, 'Beschreibung zu lang').optional()
});

export const addMemberSchema = z.object({
    email: z.string().email('Gültige E-Mail-Adresse erforderlich')
});

export const changeGroupNameSchema = z.object({
    name: z.string().min(3, 'Der neue Gruppenname muss mindestens 3 Zeichen lang sein.'),
});

export type CreateGroupSchema = typeof createGroupSchema;
export type AddMemberSchema = typeof addMemberSchema;
export type ChangeGroupNameSchema = typeof changeGroupNameSchema;