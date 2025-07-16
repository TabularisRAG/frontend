import { z } from 'zod';

export const createGroupSchema = z.object({
    name: z.string().min(1, 'Gruppenname ist erforderlich').max(100, 'Gruppenname zu lang'),
    description: z.string().max(500, 'Beschreibung zu lang').optional()
});

export const addMemberSchema = z.object({
    email: z.string().email('Gültige E-Mail-Adresse erforderlich')
});

export type CreateGroupSchema = typeof createGroupSchema;
export type AddMemberSchema = typeof addMemberSchema;