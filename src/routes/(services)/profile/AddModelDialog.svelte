
<script lang="ts">
    import { onMount } from 'svelte';
    import ModelAPI from '$lib/api/modelAPI/modelAPI.js';
    import { X, Plus } from 'lucide-svelte';
    import { m } from '$lib/paraglide/messages';
  
    const modelAPI = new ModelAPI();
  
    let { modelAdded, jwt, showAddModelDialog = $bindable(), availableProviders } = $props();
  
    let newModelForm = $state({
      provider: '',
      model_name: '',
      apiKey: '',
      total_tokens: 0
    });
  
    let isAddingModel = $state(false);
    let successMessage = $state('');
    let errorMessage = $state('');
    let dialogElement: HTMLDialogElement | null = null;
  
    $effect(() => {
      if (showAddModelDialog && dialogElement) {
        if (dialogElement.hasAttribute('open')) {
          dialogElement.close();
        }
        dialogElement.showModal();
      } else if (!showAddModelDialog && dialogElement) {
        dialogElement.close();
      }
    });
  
    onMount(async () => {
      try {
        const providers = await modelAPI.getAvailableProviders(jwt);
        availableProviders = providers.map(p => ({
          value: p,
          label: p.charAt(0) + p.slice(1).toLowerCase()
        }));
      } catch (error) {
        console.error('Fehler beim Laden der Provider:', error);
      }
    });
  
    function closeAddModelDialog() {
      showAddModelDialog = false;
      resetForm();
      clearMessages();
      if (dialogElement?.hasAttribute('open')) {
        dialogElement.close();
      }
    }
  
    function resetForm() {
      newModelForm = {
        provider: '',
        model_name: '',
        apiKey: '',
        total_tokens: 0
      };
    }
  
    function clearMessages() {
      successMessage = '';
      errorMessage = '';
    }
  
    async function addNewModel() {
      if (isAddingModel) return;
  
      if (!newModelForm.model_name.trim() || !newModelForm.apiKey.trim()) {
        errorMessage = m.model_add_required_fields();
        return;
      }
  
      try {
        isAddingModel = true;
        clearMessages();
  
        const result = await modelAPI.createModel(jwt, newModelForm);
        successMessage = m.model_add_success();
        modelAdded(result);
  
        setTimeout(() => {
          closeAddModelDialog();
        }, 1500);
      } catch (error) {
        const err = error as Error;
        console.error('Fehler beim Hinzufügen des Modells:', error);
        errorMessage = err.message || m.model_add_unknown_error();
      } finally {
        isAddingModel = false;
      }
    }
  
    function handleDialogClick(event: MouseEvent) {
      if (event.target === dialogElement) {
        closeAddModelDialog();
      }
    }
  
    function handleDialogClose() {
      showAddModelDialog = false;
      resetForm();
      clearMessages();
    }
  </script>
  
  
  <!-- Native Dialog Element -->
  <dialog 
  bind:this={dialogElement} 
  onclick={handleDialogClick}
  onclose={handleDialogClose}
  class="modal-dialog"
>
  <div class="modal-content">
    <header class="modal-header">
      <h2>{m.model_add_title()}</h2>
      <button onclick={closeAddModelDialog} aria-label={m.close()} class="close-button">
        <X size={20} />
      </button>
    </header>

    {#if successMessage}
      <div class="message success" role="status" aria-live="polite">
        <div class="message-icon">✓</div>
        {successMessage}
      </div>
    {/if}

    {#if errorMessage}
      <div class="message error" role="alert">
        <div class="message-icon">⚠</div>
        {errorMessage}
      </div>
    {/if}

    <form onsubmit={addNewModel} class="modal-form">
      <label>
        {m.provider_label()}
        <select bind:value={newModelForm.provider} required disabled={isAddingModel}>
          {#each availableProviders as p}
            <option value={p.value}>{p.label}</option>
          {/each}
        </select>
      </label>

      <label>
        {m.model_name_label()}
        <input 
          type="text" 
          bind:value={newModelForm.model_name} 
          placeholder={m.model_name_placeholder()}
          required 
          disabled={isAddingModel}
        />
        <small>{m.model_name_hint()}</small>
      </label>

      <label>
        {m.api_key_label()}
        <input 
          type="text" 
          bind:value={newModelForm.apiKey} 
          placeholder={m.api_key_placeholder()}
          required 
          disabled={isAddingModel}
        />
        <small>{m.api_key_hint()}</small>
      </label>

      <div class="form-actions">
        <button
          type="button"
          onclick={closeAddModelDialog}
          disabled={isAddingModel}
          class="btn-secondary"
        >
          <X size={16} />
          {m.cancel()}
        </button>
        <button
          type="submit"
          disabled={
            !newModelForm.model_name.trim() ||
            !newModelForm.apiKey.trim() ||
            !newModelForm.provider ||
            isAddingModel
          }
          class="btn-primary"
        >
          {#if isAddingModel}
            <div class="spinner"></div>
            {m.model_adding()}
          {:else}
            <Plus size={16} />
            {m.model_add_button()}
          {/if}
        </button>
      </div>
    </form>
  </div>
</dialog>

  
  <style>
    .modal-dialog {
        padding: 0;
        border: none;
        border-radius: 0.75rem;
        width: 500px;
        max-width: 90vw;
        max-height: 90vh;
        overflow: visible;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        
        /* Zentrieren des Dialogs */
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin: 0;
    }
  
    .modal-dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
    }
  
    .modal-content {
        padding: 2rem;
        background: white;
        border-radius: 0.75rem;
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
        .modal-dialog {
            margin: 1rem;
            width: calc(100vw - 2rem);
        }
        
        .modal-content {
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
  