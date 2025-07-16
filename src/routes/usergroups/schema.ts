import { z } from 'zod';

export const createGroupSchema = z.object({
    name: z.string().min(1, "Gruppenname ist erforderlich"),
});

type CreateGroupInput = z.infer<typeof createGroupSchema>;

