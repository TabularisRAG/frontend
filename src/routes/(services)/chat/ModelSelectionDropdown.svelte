<script lang="ts">
  import type { UUID } from "crypto";
  import {m} from '$lib/paraglide/messages.js';
  import type { Model } from "$lib/types/model";

  let { 
    availableModels, 
    model = $bindable(),
  } = $props();

  let selectedModelId = $derived<UUID>(model?.id);

  $effect(() => {
    model = availableModels.find((m: Model) => m.id === selectedModelId);
  });

</script>

<select bind:value={selectedModelId} class="px-3 py-2 border rounded-md max-w-44">
  <option disabled value={null}>{m.available_models()}</option>
  {#each availableModels as model}
    <option value={model.id}>{model.model_name}</option>
  {/each}
</select>
