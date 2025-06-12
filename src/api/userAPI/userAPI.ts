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
            console.log(data)
            return new User(data.email, data.lastname, data.firstname, data.isAdmin);
        } catch (error) {
            console.error("Login failed:", error);
            throw new Error("Failed to load user");
        }

    }


}