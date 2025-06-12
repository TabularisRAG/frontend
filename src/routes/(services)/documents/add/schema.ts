import {z} from 'zod/v4';
import {m} from '$lib/paraglide/messages.js';

export const KILOBYTE = 1024;
export const MEGABYTE = 1024 * KILOBYTE;
export let schema = z.object({
    file: z.array(z.file(m['pages.documents.form.file_missing']()).max(MEGABYTE * 10, m['pages.documents.form.file_too_large']())),
    title: z.string(m['pages.documents.form.title_missing']()).min(3, m['pages.documents.form.title_too_short']()),
    year: z.int(m['pages.documents.form.year_missing']()),
    author: z.string().nonempty(m['pages.documents.form.author_missing']()),
    keywords: z.string().array().min(1, m['pages.documents.form.keywords_missing']())
})