import type { ModelData } from "$lib/entities/modelData";

export interface AdminData {
    availableModels: ModelData[];
    availableProviders: string[];
    isLoading: boolean;
}