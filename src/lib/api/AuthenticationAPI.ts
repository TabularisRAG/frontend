import type {RequestEvent} from "@sveltejs/kit";
import type {Session} from "$lib/entities/session";
import {LoginUser, RegistrationUser, User, type UserResponse} from "$lib/entities/user";
import APIClient from "$lib/api/ApiClient";

export const SESSION_COOKIE_NAME = "auth-session";

export class AuthenticationAPI extends APIClient {

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

    public async resetPassword(userEmail: string, newPassword: string) {
        if (!userEmail || !newPassword) {
            throw new Error("Email and new password are required");
        }

        const response = await fetch(this.serverURL + "/auth/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_email: userEmail,
                new_password: newPassword
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            
            // Handle specific error cases based on your Python API
            if (response.status === 404) {
                throw new Error("User not found");
            } else if (response.status === 403) {
                throw new Error("Default admin password cannot be reset");
            } else {
                throw new Error(`Password reset failed: ${errorText}`);
            }
        }

        const result = await response.json();
        return result as {
            message: string;
            requires_reactivation: boolean;
        };
    }

    public async getInactiveUsers(event: RequestEvent) {
        if (!event.locals.session?.token) {
            throw new Error("No session found");
        }

        const response = await fetch(this.serverURL + "/auth/inactive-users", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${event.locals.session.token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();

            if (response.status === 403) {
                throw new Error("Access denied. Admin privileges required");
            } else if (response.status === 401) {
                throw new Error("Authentication required");
            } else {
                throw new Error(`Failed to retrieve inactive users: ${errorText}`);
            }
        }

        const result = await response.json();
        return result as {
            inactive_users: UserResponse[];
            count: number;
            message: string;
        };
    }

    public async logout(event: RequestEvent) {
        if (!event.locals.session) {
            throw new Error("No session found");
        }
        this.deleteSession(event);
    }

    public async changePassword(newPassword: string, event: RequestEvent, oldPassword?: string) {
        if (!newPassword) {
            throw new Error("New password is required");
        }

        if (!event.locals.session?.token) {
            throw new Error("No session found");
        }

        const requestBody: { new_password: string; old_password?: string } = {
            new_password: newPassword
        };

        if (oldPassword) {
            requestBody.old_password = oldPassword;
        }

        const response = await fetch(this.serverURL + "/auth/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${event.locals.session.token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();

            if (response.status === 403) {
                throw new Error("Default admin password cannot be changed");
            } else if (response.status === 401) {
                throw new Error("Authentication failed. Check your old password");
            } else {
                throw new Error(`Password change failed: ${errorText}`);
            }
        }

        const result = await response.json();
        return result as {
            message: string;
            requires_reactivation: boolean;
        };
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