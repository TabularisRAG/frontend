import type { User } from "../../entities/user";
import APIClient from "../ApiClient";

export default class AuthenticationAPI extends APIClient {

    public async login(user: User): Promise<string> {
        console.log("API Client login")
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
    

}