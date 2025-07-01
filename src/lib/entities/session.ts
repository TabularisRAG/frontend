export class Session {
    constructor(
        readonly id: string,
        readonly userId: string,
        readonly token: string,
        public expiresAt: Date
    ) {}
}