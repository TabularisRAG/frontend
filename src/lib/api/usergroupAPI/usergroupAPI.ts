import type { UserGroup } from "$lib/entities/groups";
import APIClient from "../ApiClient";

const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG4yLnNtaXRoQGV4YW1wbGUuY29tIiwiZXhwIjoxNzUyNzQ0MDcwfQ.wwprdMMf1YL1lNwww1av_qVT9AOG3mnRA6UfsHR9oQE"
export default class UserGroupAPI extends APIClient {

    public async createUserGroup(user_group : any, jwt : string) {
        const jwtToken = jwt
        const result = await fetch(this.serverURL + "/api/groups/new", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
            },
            method: "POST",
            body: JSON.stringify(user_group),
        });
    
        return result; 
    }

    public async getUserGroups(jwt : string) {
        const jwtToken = jwt
        const result = await fetch(this.serverURL + "/api/groups", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`, // Include JWT here
            },
            method: "GET",
        });
    
        const usergroups :  UserGroup[] = await result.json();
        return usergroups; 
    }
    

    public async getUserGroup(id : string, jwt : string) {
        const result = await fetch(this.serverURL + "/api/groups/" + id, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
            },
            method: "GET",
        });
    
        const usergroup :  UserGroup = await result.json();

        console.log(usergroup)
        return usergroup; 
    }
}