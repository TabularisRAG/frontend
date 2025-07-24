interface BaseUser {
    email: string;
}

export class LoginUser implements BaseUser {
    constructor(
        readonly email: string,
        readonly password: string
    ) {
    }
}

export class RegistrationUser implements BaseUser {
    constructor(
        readonly email: string,
        readonly lastName: string,
        readonly firstName: string,
        readonly isAdmin: boolean = false,
        readonly password: string
    ) {
    }

    public getFullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}

export class User implements BaseUser {
    constructor(
        readonly id: string,
        readonly email: string,
        readonly lastName: string,
        readonly firstName: string,
        readonly is_admin: boolean = false,
    ) {}

    public getFullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}
export interface UserResponse {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_admin: boolean;
    is_activated: boolean;
}