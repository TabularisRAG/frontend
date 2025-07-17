<script lang="ts">
  import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "$lib/components/ui/dialog/index.js";
  import {Button} from "$lib/components/ui/button/index";
  import { createEventDispatcher, getContext } from 'svelte';
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";

  let {href, text} =  $props();
  const token = getContext<() => string>('token');

  let citationDialogOpen = $state(false);
  let citationContent = $state("");
  let citationLoading = $state(false);
  let citationError = $state("");
  let currentCitationId = $state("");

  function handleClick() {
    const chunk_id = href.split('citation://')[1];
    loadCitation(chunk_id)
  }

  async function loadCitation(id: string) {
    currentCitationId   = id;
    citationDialogOpen = true;
    citationLoading    = true;
    citationError      = '';
    citationContent    = '';

    console.log(token);

    try {
      const res = await fetch(`http://localhost:8000/api/documents/chunks/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) throw new Error('Error loading citation');
      const json = await res.json();
      citationContent = json.chunk_text;
    } catch {
      citationError = 'Source could not be loaded';
    } finally {
      citationLoading = false;
    }
  }

</script>

<button
  type="button"
  class="underline text-blue-600 hover:text-blue-800"
  style="display: inline-block; background: none; border: none; padding: 0; margin: 0; font: inherit; cursor: pointer;"
  onclick={handleClick}
>
  {text}
</button>

<Dialog bind:open={citationDialogOpen}>
  <DialogContent class="max-w-2xl max-h-[80vh]">
    <DialogHeader>
      <DialogTitle>Quellennachweis</DialogTitle>
      <DialogDescription>
        Vollständiger Text der referenzierten Quelle
      </DialogDescription>
    </DialogHeader>

    <div class="mt-4 max-h-[60vh] overflow-y-auto">
      {#if citationLoading}
        <div class="flex items-center justify-center py-12">
          <LoaderCircle class="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      {:else if citationError}
        <div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p class="text-sm text-destructive">{citationError}</p>
        </div>
      {:else if citationContent}
        <div class="rounded-lg bg-muted/50 p-6">
          <div class="whitespace-pre-wrap text-sm">
            {citationContent}
          </div>
        </div>
      {/if}
    </div>

    <DialogFooter>
      <Button variant="outline" onclick={() => citationDialogOpen = false}>
        Schließen
      </Button>
      {#if citationContent && !citationLoading}
        <Button 
          variant="secondary"
          onclick={() => navigator.clipboard.writeText(citationContent)}
        >
          Text kopieren
        </Button>
      {/if}
    </DialogFooter>
  </DialogContent>
</Dialog>

