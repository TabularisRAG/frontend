import type { ModelData } from "$lib/entities/modelData";
import APIClient from "../ApiClient";

export default class ModelAPI extends APIClient {

 public async createModel(jwt: string, modelData: ModelData) {
    try {
        const response = await fetch(this.serverURL + "/api/chats/create-llm-models", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + jwt
            },
            body: JSON.stringify({
                provider: modelData.provider,
                model_name: modelData.model.trim(),
                api_key: modelData.apiKey?.trim()
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || 
                                errorData.error || 
                                `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }
        return await response.json();
    } catch (error) {

        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Error: No connection to the server possible');
        }
        throw error;
    }
}

public async getAvailableProviders(jwt: string): Promise<string[]> {
    try {
        const response = await fetch(this.serverURL + "/api/chats/available-providers", {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message ||
                                 errorData.error ||
                                 `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        const result = await response.json();
        return result.providers || [];
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Error: No connection to the server possible');
        }
        throw error;
    }
}

public async getAvailableModels(jwt: string): Promise<ModelData[]> {
    try {
        const response = await fetch(`${this.serverURL}/api/chats/llm-models`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message ||
                                 errorData.error ||
                                 `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        const result = await response.json();
        const rawModels = result.models || [];

        // Mapping der Server-Modelle in ModelData
        const models: ModelData[] = rawModels.map((m: any) => ({
            provider: m.provider,
            model: m.model_name,
            apiKey: undefined // nicht vom Server geliefert
        }));

        return models;
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Error: No connection to the server possible');
        }
        throw error;
    }
}

}

