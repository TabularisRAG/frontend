import type {PageServerLoad} from './$types';
import {DocumentAPI} from "$lib/api/DocumentAPI";
import {SESSION_COOKIE_NAME} from "$lib/api/AuthenticationAPI";
import {Doc} from "$lib/entities/doc";

export const load: PageServerLoad = async ({cookies}) => {

    let token = cookies.get(SESSION_COOKIE_NAME) ?? ""

    return {
        documents: structuredClone(await new DocumentAPI().getDocuments(token)),
        token: token
    };
}