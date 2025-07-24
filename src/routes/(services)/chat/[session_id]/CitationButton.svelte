<script lang="ts">
  import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "$lib/components/ui/dialog/index.js";
  import {Button} from "$lib/components/ui/button/index";
  import { getContext } from 'svelte';
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import BookMark from "@lucide/svelte/icons/book-marked";
  import {m} from '$lib/paraglide/messages.js';
    import { DocumentAPI } from "$lib/api/DocumentAPI";

  let {href} =  $props();
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

    try {
      const chunk = await new DocumentAPI().getDocumentChunk(token, id);
      citationContent = chunk.chunk_text;
    } catch {
      citationError = "Citation could not be loaded..." 
    } finally {
      citationLoading = false;
    }
  }

</script>

<Button 
  variant="link" 
  class="p-0 h-4 w-3 font-normal text-primary hover:text-gray-500 cursor-pointer"
  onclick={handleClick}
>
  <BookMark /> 
</Button>

<Dialog bind:open={citationDialogOpen}>
  <DialogContent class="max-w-2xl max-h-[80vh]">
    <DialogHeader>
      <DialogTitle>{m.source_reference()}</DialogTitle>
      <DialogDescription>
        {m.full_text_from_source()}
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
        {m.close()}
      </Button>
      {#if citationContent && !citationLoading}
        <Button 
          variant="secondary"
          onclick={() => navigator.clipboard.writeText(citationContent)}
        >
          {m.copy()}
        </Button>
      {/if}
    </DialogFooter>
  </DialogContent>
</Dialog>

