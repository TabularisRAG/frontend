import type { UserGroup } from "$lib/entities/groups";
import APIClient from "../ApiClient";
import type { GetAllUserGroupsResponse, UserGroupDTO, UserDTO, AssignmentDTO, CreateUserGroupDTO } from "./response/GetAllUserGroupsResponse";

export default class UserGroupAPI extends APIClient {

    public async createUserGroup(user_group : any, jwt : string) {
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
        const result = await fetch(this.serverURL + "/api/groups", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
            },
            method: "GET",
        });
    
        const response :  GetAllUserGroupsResponse = await result.json();
        return response; 
    }

    public async getUserGroup(id: string, jwt: string): Promise<UserGroupDTO> {
        const result = await fetch(this.serverURL + "/api/groups/" + id, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
            },
            method: "GET",
        });

        if (!result.ok) {
            const errorData = await result.json();
            throw new Error(errorData.detail || `Error loading group: ${result.statusText}`);
        }

        const groupData: UserGroupDTO = await result.json();
        return groupData;
    }

    public async addMemberToGroup(groupId: string, userId: string, assignAsLeader: boolean, jwt: string): Promise<Response> {
        const result = await fetch(`${this.serverURL}/api/groups/${groupId}/assign`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
            },
            method: "POST",
            body: JSON.stringify({
                user_id: userId,
                assign_as_leader: assignAsLeader
            }),
        });

        if (!result.ok) {
            const errorData = await result.json();
            throw new Error(errorData.detail || `Error adding member: ${result.statusText}`);
        }

        return result;
    }

    public async removeMemberFromGroup(groupId: string, userId: string, jwt: string): Promise<Response> {
        const result = await fetch(`${this.serverURL}/api/groups/${groupId}/unassign`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
            },
            method: "POST",
            body: JSON.stringify({
                user_id: userId
            }),
        });

        if (!result.ok) {
            const errorData = await result.json();
            throw new Error(errorData.detail || `Error removing member: ${result.statusText}`);
        }

        return result;
    }

    public async updateMemberLeaderStatus(groupId: string, userId: string, makeLeader: boolean, jwt: string): Promise<Response> {
        const result = await fetch(`${this.serverURL}/api/groups/${groupId}/change_user_role`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
            },
            method: "POST",
            body: JSON.stringify({
                user_id: userId,
                assign_as_leader: makeLeader
            }),
        });

        if (!result.ok) {
            const errorData = await result.json();
            throw new Error(errorData.detail || `Error changing user role: ${result.statusText}`);
        }

        return result;
    }

    public async updateGroupName(groupId: string, newName: string, jwt: string): Promise<CreateUserGroupDTO> {
        const result = await fetch(`${this.serverURL}/api/groups/${groupId}/rename`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
            },
            method: "POST",
            body: JSON.stringify({
                name: newName
            }),
        });

        if (!result.ok) {
            const errorData = await result.json();
            throw new Error(errorData.detail || `Error renaming group: ${result.statusText}`);
        }

        const responseData: CreateUserGroupDTO = await result.json();
        return responseData;
    }

    public async deleteGroup(groupId: string, jwt: string): Promise<Response> {
        const result = await fetch(`${this.serverURL}/api/groups/${groupId}/delete`, {
            headers: {
                "Authorization": `Bearer ${jwt}`,
            },
            method: "DELETE",
        });

        if (!result.ok) {
            const errorData = await result.json();
            throw new Error(errorData.detail || `Error deleting group: ${result.statusText}`);
        }

        return result;
    }
}