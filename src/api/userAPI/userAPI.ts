import { User } from "../../entities/user";
import APIClient from "../ApiClient";


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


}