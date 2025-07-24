export class UserDTO {
    constructor(
        readonly id: string,
        readonly email: string,
        readonly last_name: string,
        readonly first_name: string,
        readonly is_admin: boolean = false
    ) {}
}