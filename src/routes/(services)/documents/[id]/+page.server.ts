import type {PageServerLoad} from './$types';
import {DocumentAPI} from '$lib/api/DocumentAPI';
import {SESSION_COOKIE_NAME} from "$lib/api/AuthenticationAPI";

export const load: PageServerLoad = async ({cookies, params}) => {
    const token = cookies.get(SESSION_COOKIE_NAME) ?? "";

    const documentApi = new DocumentAPI();

    return {
        markdown: documentApi.getFullMarkdown(token, params.id),
        document: await documentApi.getDocument(token, params.id)
    };
};