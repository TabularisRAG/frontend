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
}