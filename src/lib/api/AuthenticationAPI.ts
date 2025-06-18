import {BaseAPI} from "./BaseAPI";
import type {RequestEvent} from "@sveltejs/kit";
import * as argon2 from "@node-rs/argon2";
import type {Session} from "$lib/entities/session";
import {LoginUser, RegistrationUser, User} from "$lib/entities/user";

export const SESSION_COOKIE_NAME = "auth-session";

export class AuthenticationAPI extends BaseAPI {

    public async login(loginUser: LoginUser, event: RequestEvent) {
        const hashedPassword = await this.hashPassword(loginUser.password);
            const response: Response = await fetch(this.serverURL + "/auth/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: loginUser.email,
                    password: hashedPassword
                })
            })

        if (!response.ok) {
            throw new Error(`Login failed! Status: ${response.status} - ${await response.text()}`);
        }

        const {session, user} = await response.json() as { session: Session, user: User };
        if (!session || !user) {
            throw new Error(`Login failed - no session or user returned`);
        }

        this.setSessionAndUser(session, user, event);
    }

    public async validateSessionToken(token: string, event: RequestEvent) {
        const response = await fetch(this.serverURL + "/auth/validate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token
            })
        })
        if (!response.ok) {
            console.error(`Validation failed! Status: ${response.status} - ${await response.text()}`);
        }

        const {session, user} = await response.json() as { session: Session | null, user: User | null };
        if (!session || !user) {
            this.deleteSession(event)
        } else {
            this.setSessionAndUser(session, user, event);
        }
    }

    public async registerUser(newUser: RegistrationUser) {

        if (!newUser.password) {
            throw new Error("Password is required");
        }

        const response = await fetch(this.serverURL + "/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                isAdmin: newUser.isAdmin,
                password: await this.hashPassword(newUser.password)
            })
        })

        if (!response.ok) {
            throw new Error(`Registration failed! Status: ${response.status} - ${await response.text()}`);
        }
    }

    public async logout(event: RequestEvent) {
        if (!event.locals.session) {
            throw new Error("No session found");
        }
        const sessionId = event.locals.session.id;
        const response = await fetch(this.serverURL + "/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sessionId
            })
        })

        if (!response.ok) {
            throw new Error(`Logout failed! Status: ${response.status} - ${await response.text()}`);
        }

        this.deleteSession(event);
    }

    private async hashPassword(password: string): Promise<string> {
        return await argon2.hash(password);
    }

    public setSessionAndUser(session: Session, user: User, event: RequestEvent) {
        event.cookies.set(SESSION_COOKIE_NAME, session.token, {
            path: "/",
            expires: session.expiresAt
        })
        event.locals.session = session
        event.locals.user = user
    }

    public deleteSession(event: RequestEvent) {
        event.cookies.delete(SESSION_COOKIE_NAME, {
            path: "/"
        })
        event.locals.session = null
        event.locals.user = null
    }
}