import type { ModelData } from "$lib/entities/modelData";
import APIClient from "../ApiClient";

export default class ModelAPI extends APIClient {

  public async getModels(token: string) {
    try {
      const response = await fetch(`${this.serverURL}/api/chats/llm-models`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get models:', error);
      throw error;
    }
  }

 public async createModel(jwt: string, modelData: ModelData) {
    try {
        const response = await fetch(this.serverURL + "/api/chats/create-llm-models", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + jwt
            },
            body: JSON.stringify({
                provider: modelData.provider.toUpperCase(),
                model_name: modelData.model_name.trim(),
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
        return await this.getAvailableModels(jwt);
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
        const response = await fetch(`${this.serverURL}/api/chats/llm-models_with_token_usage`, {
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

        const mappedModels : ModelData[] = await response.json();

        return mappedModels;
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Error: No connection to the server possible');
        }
        throw error;
    }
}

}
