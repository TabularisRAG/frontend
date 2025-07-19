<script>
    import { createEventDispatcher } from 'svelte';
    import ModelAPI from '$lib/api/modelAPI/modelAPI.js';
    import { X, Plus } from 'lucide-svelte';
  
    const modelAPI = new ModelAPI();
    export let jwt = '';
    export let showAddModelDialog = false;
    export let availableProviders = [
        { value: 'OPENAI', label: 'OpenAI' },
        { value: 'ANTHROPIC', label: 'Anthropic' },
        { value: 'GOOGLE', label: 'Google' }
    ];

    let newModelForm = {
        provider: 'OPENAI',
        model: '',
        apiKey: ''
    };

    let isAddingModel = false;
    let successMessage = '';
    let errorMessage = '';

    const dispatch = createEventDispatcher();

    function closeAddModelDialog() {
        showAddModelDialog = false;
        resetForm();
        clearMessages();
    }

    function resetForm() {
        newModelForm = {
            provider: 'OPENAI',
            model: '',
            apiKey: ''
        };
    }

    function clearMessages() {
        successMessage = '';
        errorMessage = '';
    }

    async function addNewModel() {
        if (isAddingModel) return;
        
        if (!newModelForm.model.trim() || !newModelForm.apiKey.trim()) {
            errorMessage = 'Bitte füllen Sie alle erforderlichen Felder aus';
            return;
        }

        try {
            isAddingModel = true;
            clearMessages();

            const result = await modelAPI.createModel(jwt, newModelForm);
            successMessage = 'Modell erfolgreich hinzugefügt!';

            // Event dispatchen mit den Modelldaten
            dispatch('modelAdded', result);

            setTimeout(() => {
                closeAddModelDialog();
            }, 1500);
        } catch (error) {
            console.error('Fehler beim Hinzufügen des Modells:', error);
            errorMessage = error.message || 'Ein unbekannter Fehler ist aufgetreten';
        } finally {
            isAddingModel = false;
        }
    }

    // Provider-spezifische Hinweise
    $: providerInfo = getProviderInfo(newModelForm.provider);

    function getProviderInfo(provider) {
        const info = {
            'OPENAI': {
                examples: 'gpt-4, gpt-4-turbo, gpt-3.5-turbo',
                keyFormat: 'sk-...',
                color: 'blue'
            },
            'ANTHROPIC': {
                examples: 'claude-3-opus, claude-3-sonnet, claude-3-haiku',
                keyFormat: 'sk-ant-...',
                color: 'purple'
            },
            'GOOGLE': {
                examples: 'gemini-pro, gemini-pro-vision',
                keyFormat: 'Google AI Studio API Key',
                color: 'green'
            }
        };
        return info[provider] || { examples: '', keyFormat: '', color: 'blue' };
    }
</script>

{#if showAddModelDialog}
    <div class="modal-overlay" on:click={closeAddModelDialog} role="dialog" aria-modal="true">
        <div class="modal" on:click|stopPropagation role="document">
            <header class="modal-header">
                <h2>Neues Modell hinzufügen</h2>
                <button on:click={closeAddModelDialog} aria-label="Schließen" class="close-button">
                    <X size={20} />
                </button>
            </header>

            {#if successMessage}
                <div class="message success">
                    <div class="message-icon">✓</div>
                    {successMessage}
                </div>
            {/if}

            {#if errorMessage}
                <div class="message error">
                    <div class="message-icon">⚠</div>
                    {errorMessage}
                </div>
            {/if}

            <form on:submit|preventDefault={addNewModel} class="modal-form">
                <label>
                    Provider:
                    <select bind:value={newModelForm.provider} required disabled={isAddingModel}>
                        {#each availableProviders as p}
                            <option value={p.value}>{p.label}</option>
                        {/each}
                    </select>
                </label>

                <label>
                    Modell Name:
                    <input 
                        type="text" 
                        bind:value={newModelForm.model} 
                        placeholder="z.B. gpt-4-turbo, claude-3-opus"
                        required 
                        disabled={isAddingModel}
                    />
                    <small>Geben Sie den exakten Modellnamen ein, wie er von der API verwendet wird</small>
                </label>

                <label>
                    API Key:
                    <input 
                        type="text" 
                        bind:value={newModelForm.apiKey} 
                        placeholder="Ihr API Key für diesen Provider"
                        required 
                        disabled={isAddingModel}
                    />
                    <small>Der API Key wird sicher verschlüsselt gespeichert</small>
                </label>

                <!-- Provider-spezifische Hinweise -->
                {#if providerInfo.examples}
                    <div class="provider-info {providerInfo.color}">
                        <strong>{availableProviders.find(p => p.value === newModelForm.provider)?.label} Modelle:</strong><br>
                        Beispiele: {providerInfo.examples}<br>
                        API Key Format: {providerInfo.keyFormat}
                    </div>
                {/if}

                <div class="form-actions">
                    <button type="button" on:click={closeAddModelDialog} disabled={isAddingModel} class="btn-secondary">
                        <X size={16} />
                        Abbrechen
                    </button>
                    <button 
                        type="submit" 
                        disabled={!newModelForm.model.trim() || 
                                 !newModelForm.apiKey.trim() || 
                                 !newModelForm.provider || 
                                 isAddingModel}
                        class="btn-primary"
                    >
                        {#if isAddingModel}
                            <div class="spinner"></div>
                            Wird hinzugefügt...
                        {:else}
                            <Plus size={16} />
                            Modell hinzufügen
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(2px);
    }

    .modal {
        background: white;
        padding: 2rem;
        border-radius: 0.75rem;
        width: 500px;
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
    }

    .close-button {
        background: none;
        border: none;
        padding: 0.5rem;
        border-radius: 0.375rem;
        cursor: pointer;
        color: #6b7280;
        transition: all 0.2s;
    }

    .close-button:hover {
        background: #f3f4f6;
        color: #111827;
    }

    .message {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        font-size: 0.875rem;
    }

    .message-icon {
        margin-right: 0.5rem;
        font-weight: bold;
    }

    .message.success {
        background: #dcfce7;
        border: 1px solid #bbf7d0;
        color: #166534;
    }

    .message.error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
    }

    .modal-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .modal-form label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-weight: 500;
        color: #374151;
    }

    .modal-form input,
    .modal-form select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        transition: all 0.2s;
    }

    .modal-form input:focus,
    .modal-form select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .modal-form input:disabled,
    .modal-form select:disabled {
        background: #f9fafb;
        color: #6b7280;
        cursor: not-allowed;
    }

    .modal-form small {
        font-size: 0.75rem;
        color: #6b7280;
        margin-top: 0.25rem;
    }

    .provider-info {
        padding: 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        line-height: 1.5;
    }

    .provider-info.blue {
        background: #eff6ff;
        color: #1e40af;
        border: 1px solid #dbeafe;
    }

    .provider-info.purple {
        background: #faf5ff;
        color: #7c3aed;
        border: 1px solid #e9d5ff;
    }

    .provider-info.green {
        background: #f0fdf4;
        color: #166534;
        border: 1px solid #dcfce7;
    }

    .provider-info.orange {
        background: #fff7ed;
        color: #c2410c;
        border: 1px solid #fed7aa;
    }

    .provider-info.gray {
        background: #f9fafb;
        color: #374151;
        border: 1px solid #e5e7eb;
    }

    .form-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
    }

    .btn-primary,
    .btn-secondary {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border-radius: 0.375rem;
        font-weight: 500;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;
    }

    .btn-primary {
        background: #3b82f6;
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background: #2563eb;
    }

    .btn-primary:disabled {
        background: #9ca3af;
        cursor: not-allowed;
    }

    .btn-secondary {
        background: white;
        color: #374151;
        border-color: #d1d5db;
    }

    .btn-secondary:hover:not(:disabled) {
        background: #f9fafb;
    }

    .btn-secondary:disabled {
        color: #9ca3af;
        cursor: not-allowed;
    }

    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* Mobile Responsiveness */
    @media (max-width: 640px) {
        .modal {
            margin: 1rem;
            padding: 1.5rem;
        }

        .form-actions {
            flex-direction: column-reverse;
        }

        .btn-primary,
        .btn-secondary {
            width: 100%;
            justify-content: center;
        }
    }
</style>