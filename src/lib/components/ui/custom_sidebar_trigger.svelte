<script lang="ts">
  import { useSidebar } from "$lib/components/ui/sidebar/index.js";
  import TriggerOpen from "$lib/icons/trigger_open.svg"
  import TriggerClose from "$lib/icons/trigger_close.svg"
  const sidebar = useSidebar();
</script>
 
<button class="flex justify-end" onclick={() => {
  sidebar.toggle();
  }}>
  {#if sidebar.open}
    <img src={TriggerOpen} alt="Sidebar öffnen" class="w-6 h-6" />
  {:else}
    <img src={TriggerClose} alt="Sidebar öffnen" class="w-6 h-6" />
  {/if}
</button>


