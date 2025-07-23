import { User } from "$lib/entities/user";
import APIClient from "../ApiClient";
import type { UserDTO } from "./response/UserDTO";


export default class UserAPI extends APIClient {


    public async loadUser(jwt: string): Promise<User> {

        try {
            const response = await fetch(this.serverURL + "/user/me", {
                method: "GET",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Bearer " + jwt
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            const loggedInUser = new User(data.email, data.last_name, data.first_name, data.is_admin);
            console.log("Loaded user: ", loggedInUser)
            return loggedInUser
        } catch (error) {
            console.error("Login failed:", error);
            throw new Error("Failed to load user");
        }

    }

    public async getAllUsers(jwt : string) {

        try {
            const response = await fetch(this.serverURL + "/user/all", {
                method: "GET",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Bearer " + jwt
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data : UserDTO[] = await response.json();
            return data
           
        } catch (error) {
            console.error("Login failed:", error);
            throw new Error("Failed to load user");
        }

    }

    public async changePassword(jwt: string, currentPassword: string, newPassword: string): Promise<void> {
        try {
            const response = await fetch(this.serverURL + "/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify({
                    new_password: newPassword,
                    old_password: currentPassword
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
            
                // Fehlercode lokal bestimmen
                if (response.status === 403) {
                  throw new Error("ERR_DEFAULT_ADMIN_PASSWORD");
                }
            
                if (response.status === 401 || /invalid|wrong|incorrect/i.test(errorMessage)) {
                  throw new Error("ERR_INCORRECT_OLD_PASSWORD");
                }
            
                throw new Error("ERR_UNKNOWN");
            }
        } catch (error) {
            // Gibt die spezifische Fehlermeldung weiter, falls vorhanden
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Fehler beim Ändern des Passworts.");
            }
        }
    }
    
    
}