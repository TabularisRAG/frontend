<script lang="ts">
import { useSidebar } from "$lib/components/ui/sidebar/index.js";
import PanelRightClose from "@lucide/svelte/icons/panel-right-close";
import PanelRightOpen from "@lucide/svelte/icons/panel-right-open";

const sidebar = useSidebar();
</script>

<button class="flex justify-end" onclick={() => {
  sidebar.toggle();
}}>
  {#if sidebar.open}
    <PanelRightOpen/>
  {:else}
    <PanelRightClose/>
  {/if}
</button>


