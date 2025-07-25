import type {PageServerLoad} from './$types';
import {DocumentAPI} from "$lib/api/DocumentAPI";
import {SESSION_COOKIE_NAME} from "$lib/api/AuthenticationAPI";
import UserGroupAPI from "$lib/api/usergroupAPI/usergroupAPI";

export const load: PageServerLoad = async ({cookies, url}) => {

    let token = cookies.get(SESSION_COOKIE_NAME) ?? ""
    let documentIds = url.searchParams.get("documents")?.split(",") ?? []

    return {
        token,
        documentIds,
        documents: await new DocumentAPI().getDocuments(token),
        groups: (await new UserGroupAPI().getUserGroups(token)).groups
    };
}