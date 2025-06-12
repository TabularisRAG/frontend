export class User {
    constructor(
        public email: string,
        public lastName?: string,
        public firstName?: string,
        public isAdmin?: boolean,
        public password?: string
    ) {}
}