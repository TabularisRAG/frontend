import type { UserGroup } from "$lib/entities/groups";

export class GetAllUserGroupsResponse {
    constructor(
        readonly groups : UserGroup[],
        readonly number_of_unique_documents : Number

    ){}
}