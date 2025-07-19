import type { ModelData } from "$lib/entities/modelData";
import APIClient from "../ApiClient";

export default class ModelAPI extends APIClient {

 public async createModel(jwt: string, modelData: ModelData) {
    console.log(modelData)
    try {
        const response = await fetch(this.serverURL + "/chat/model/create_llm-models", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + jwt
            },
            body: JSON.stringify({
                provider: modelData.provider,
                model_name: modelData.model.trim(),
                api_key: modelData.apiKey.trim()
            })
        });

        if (!response.ok) {
            // Versuche detaillierte Fehlermeldung vom Server zu bekommen
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || 
                                errorData.error || 
                                `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        // Netzwerk- oder andere Fehler
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Netzwerkfehler: Keine Verbindung zum Server möglich');
        }
        throw error;
    }
}
}

