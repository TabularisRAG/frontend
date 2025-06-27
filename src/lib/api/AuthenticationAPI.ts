import {BaseAPI} from "./BaseAPI";
import type {RequestEvent} from "@sveltejs/kit";
import type {Session} from "$lib/entities/session";
import {LoginUser, RegistrationUser, User} from "$lib/entities/user";

export const SESSION_COOKIE_NAME = "auth-session";

export class AuthenticationAPI extends BaseAPI {

    public async login(loginUser: LoginUser, event: RequestEvent) {
        const params = new URLSearchParams({
            grant_type: 'password',
            username: loginUser.email,  
            password: loginUser.password, 
        });
        
        const response: Response = await fetch(this.serverURL + "/auth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params
        });
    
        const json = await response.json();
    
        console.log("This is the response:", json);
    
        const { session, user } = json as { session: Session, user: User };
    
        if (!session || !user) {
            throw new Error(`Login failed - no session or user returned`);
        }
    
        this.setSessionAndUser(session, user, event);
    }

    public async validateSessionToken(token: string, event: RequestEvent) {
        console.log("VALIDATE TOKEN ", token)
        const response = await fetch(this.serverURL + "/auth/validate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: token
            })
        })
    
        const responseBody = await response.text();
    
        if (!response.ok) {
            console.error(`Validation failed! Status: ${response.status} - ${responseBody}`);
            this.deleteSession(event);
            return;
        }
    
        const { session, user } = JSON.parse(responseBody) as { session: Session | null, user: User | null };
    
        if (!session || !user) {
            this.deleteSession(event);
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
                first_name: newUser.firstName,
                last_name: newUser.lastName,
                is_admin: newUser.isAdmin,
                password: newUser.password
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
        this.deleteSession(event);
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