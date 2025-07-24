import APIClient from "../ApiClient";

export default class ModelAPI extends APIClient {

  public async get_available_models(token: string) {
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
}

