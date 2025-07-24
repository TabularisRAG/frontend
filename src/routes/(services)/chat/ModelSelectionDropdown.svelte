<script lang="ts">
  import * as Select from "$lib/components/ui/select/index.js";
  import type { UUID } from "crypto";
  import {m} from '$lib/paraglide/messages.js';
  import type { Model } from "$lib/types/model";

  let { 
    available_models, 
    model = $bindable(),
  } = $props();

  let selected_model_id = $derived<UUID>(model.id);

  $effect(() => {
    model = available_models.find((m: Model) => m.id === selected_model_id);
  });

</script>

<select bind:value={selected_model_id} class="px-3 py-2 border rounded-md">
  <option disabled value={null}>Model</option>
  {#each available_models as m}
    <option value={m.id}>{m.model_name}</option>
  {/each}
</select>
