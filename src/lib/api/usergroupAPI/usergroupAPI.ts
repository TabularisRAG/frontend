import type { UserGroup } from "$lib/entities/groups";
import APIClient from "../ApiClient";
import type { GetAllUserGroupsResponse } from "./response/GetAllUserGroupsResponse";

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
    
        const response :  GetAllUserGroupsResponse = await result.json();
        return response; 
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

    public async deleteUserGroup(id : string, jwt : string) {
        const result = await fetch(this.serverURL + "/api/groups/" + id + "/delete", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
            },
            method: "DELETE",
        });
    
        const parsed_result = await result.json();

        console.log(parsed_result)
        return parsed_result; 
    }

    public async unassignFromUserGroup(id : string, jwt : string) {
        const result = await fetch(this.serverURL + "/api/groups/" + id + "/unassign", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
            },
            method: "POST",
            body: JSON.stringify({"user_id" : id})
        });
    
        const parsed_result = await result.json();

        console.log(parsed_result)
        return parsed_result; 
    }
}