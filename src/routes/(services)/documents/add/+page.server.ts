import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { schema } from './schema';
import {DocumentAPI} from "$lib/api/DocumentAPI";
import {SESSION_COOKIE_NAME} from "$lib/api/AuthenticationAPI";
import {NewDocument} from "$lib/entities/doc";

export const load: PageServerLoad = async ({ request }) => {
    return { form: await superValidate(zod4(schema)) }
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        let form = await superValidate(request, zod4(schema));
        let doc = form.data
        let document = new NewDocument(doc.title, doc.year, doc.keywords, doc.author, doc.file[0])
        await new DocumentAPI().uploadDocument(cookies.get(SESSION_COOKIE_NAME) ?? "", document)
        if (!form.valid) {
            return fail(400, { form });
        }
        return message(form, 'Form Posted Successfully!');
    }
};