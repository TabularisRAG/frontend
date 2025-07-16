import type { UserGroup } from "$lib/entities/groups";
import APIClient from "../ApiClient";

export default class UserGroupAPI extends APIClient {

    public async createUserGroup(user_group: UserGroup) {
        const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG4yLnNtaXRoQGV4YW1wbGUuY29tIiwiZXhwIjoxNzUyNjY0MDc4fQ.JKuaVv5LKJEQN_Rp69Cr6YUuy5GgwkIM0bLXKDqqnW8"
        const result = await fetch(this.serverURL + "/api/groups/new", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`, // Include JWT here
            },
            method: "POST",
            body: JSON.stringify(user_group),
        });
    
        return result; 
    }

    public async getUserGroup(id : string) {
        const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG4yLnNtaXRoQGV4YW1wbGUuY29tIiwiZXhwIjoxNzUyNjY3Mzc4fQ.1mgUCa6AGyJeEaSWKdToGsCfUYGvTdXBryp9Fh5HI64"
        const result = await fetch(this.serverURL + "/api/groups/" + id, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`, // Include JWT here
            },
            method: "GET",
        });
    
        const usergroup :  UserGroup = await result.json();
        return usergroup; 
    }
}