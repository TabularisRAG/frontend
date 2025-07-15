import {z} from 'zod/v4';
import {m} from '$lib/paraglide/messages.js';

export const KILOBYTE = 1024;
export const MEGABYTE = 1024 * KILOBYTE;
export let schema = z.object({
    file: z.array(z.file(m.doc_validation_file_missing()).max(MEGABYTE * 10, m.doc_validation_file_too_large())),
    title: z.string(m.doc_validation_title_missing()).min(3, m.doc_validation_title_too_short()),
    year: z.int(m.doc_validation_year_missing()),
    author: z.string().nonempty(m.doc_validation_author_missing()),
    keywords: z.string().array().min(1, m.doc_validation_keywords_missing())
})