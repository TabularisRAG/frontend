import type { User } from "$lib/entities/user";
import APIClient from "../ApiClient";

export default class AuthenticationAPI extends APIClient {

    public async login(user: User): Promise<string> {
        const params = new URLSearchParams();
        params.append("grant_type", "password");
        params.append("username", user.email);
        if (user.password) {
            params.append("password", user.password);
        } else {
            throw new Error("Password is required");
        }
    
        try {
            const response = await fetch(this.serverURL + "/auth/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params.toString()
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            return data.access_token;  // Assuming the token is returned as 'access_token'
        } catch (error) {
            console.error("Login failed:", error);
            return "UNAUTHORIZED";
        }
    }

    public async registerUser(newUser: User): Promise<void> {
        try {
            const response = await fetch(this.serverURL + "/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: newUser.email,
                    first_name: newUser.firstName,
                    last_name: newUser.lastName,
                    password: newUser.password
                })
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Registration failed! Status: ${response.status} - ${errorText}`);
            }
    
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    }
    
    

}
