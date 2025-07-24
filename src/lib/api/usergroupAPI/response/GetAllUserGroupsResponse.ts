
export class GetAllUserGroupsResponse {
    constructor(
        readonly groups : UserGroupDTO[],
        readonly number_of_unique_documents : Number
    ){}
}

export class UserGroupDTO {
    constructor(
            readonly id: string,
            readonly name: string,
            readonly current_user_is_leader : boolean,
            readonly current_user_is_in_group : boolean,
            readonly created_at : string,
            readonly user_count : number,
            readonly leader_count : number,
            readonly assignments : AssignmentDTO[] = []
        ) {}
}

export class UserDTO {
    constructor(
        readonly id: string,
        readonly email: string,
        readonly last_name: string,
        readonly first_name: string,
        readonly is_admin: boolean = false
    ) {}
}

export class AssignmentDTO {
    constructor(
        readonly user : UserDTO,
        readonly is_leader: boolean,
        readonly joined_at: string 
    ) {}
}

export class CreateUserGroupDTO {
    constructor(
        readonly id: string, 
        readonly name: string,
        readonly created_at: string
    ) {}
}