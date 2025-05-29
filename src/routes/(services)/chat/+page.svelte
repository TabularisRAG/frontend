<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import CustomSidebarTrigger from "$lib/components/ui/custom_sidebar_trigger.svelte";
  import * as Card from "$lib/components/ui/card/index.js";

  let { data } = $props();
  const chats: any[] = [];

  let open = $state(true);
</script>

<div class="sticky top-[54px] overflow-hidden max-h-[calc(100vh-54px)] h-full">
<Sidebar.Provider bind:open>
    <Sidebar.Root collapsible="icon" class="sticky h-full left-0 max-h-[calc(100vh-54px)]">
      <Sidebar.Header>
        <Sidebar.Menu>
          <Sidebar.MenuItem class="flex justify-end"> 
            <CustomSidebarTrigger />
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Header>
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel class="px-4 py-2 text-xs font-semibold uppercase text-gray-500">
            History 
          </Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu class="flex flex-col">
              {#if open}
                {#each chats as chat (chat.title)}
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton>
                      {#snippet child({ props })}
                        <a
                          href=chat.url}
                          {...props}
                          class="block w-full px-4 py-2 text-sm hover:bg-gray-100 rounded"
                        >
                          <span>{chat.title}</span>
                        </a>
                      {/snippet}
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                {/each}
              {/if}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar.Root>

  <main class="flex flex-col flex-1 relative">
    <div class="flex sticky flex-grow justify-center max-h-[calc(100vh-54px)]">
      <ScrollArea class="h-full w-5/6 rounded-md border">
        <div class="p-4">
          
        </div>
      </ScrollArea>
    </div>
    <div class="sticky bottom-5 w-full flex justify-center">
        <Card.Root class="w-5/6">
          <Card.Content class="max-h-fit">
          <form class="flex w-full max-h-48 items-center space-x-2">
            <Textarea class="h-fit max-h-36 overflow-auto" placeholder="Enter your prompt ..." />
            <Button type="submit">Send</Button>
          </form>
        </Card.Content>
        <Card.Footer>
            <p>Parameter selection</p>
          </Card.Footer>
        </Card.Root>
      </div>
    </main>
</Sidebar.Provider>
</div>
