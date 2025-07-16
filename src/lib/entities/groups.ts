export class UserGroup {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly current_user_is_leader : boolean,
        readonly created_at : string,
        readonly user_count : number
    ) {}
}