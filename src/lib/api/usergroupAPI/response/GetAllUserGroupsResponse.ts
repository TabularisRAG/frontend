import type { UserGroup } from "$lib/entities/groups";
import type { User } from "$lib/entities/user";

export class GetAllUserGroupsResponse {
    constructor(
        readonly groups : UserGroup[],
        readonly number_of_unique_documents : Number

    ){}
}

export class UserGroupDTO {
    constructor(
            readonly id: string,
            readonly name: string,
            readonly current_user_is_leader : boolean,
            readonly created_at : string,
            readonly user_count : number,
            readonly assignments : AssignmentDTO[] = []
        ) {}
}

export class UserDTO {
    constructor(
        readonly id: string,
        readonly email: string,
        readonly last_name: string,
        readonly first_name: string,
        readonly isAdmin: boolean = false
    ) {}
}

export class AssignmentDTO {
    constructor(
            readonly user : UserDTO,
            readonly is_leader: string,
            readonly joined_at: string 
        ) {}
}