<script lang="ts">
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import CirclePlus from "@lucide/svelte/icons/circle-plus";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import CustomSidebarTrigger from "$lib/components/ui/custom_sidebar_trigger.svelte";
  import {m} from '$lib/paraglide/messages.js';


  let { data, children } = $props();
  const chats: any[] = [
      {
      title: "Home",
      url: "#",
      icon: CirclePlus,
    },
  ];
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
          <Sidebar.GroupContent>
          <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton>
                  {#snippet child({ props })}
                    <a href="/chat" {...props}>
                      <Tooltip.Provider>
                        <Tooltip.Root>
                          <Tooltip.Trigger>
                            <CirclePlus />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            <p>{m.new_chat()}</p>
                          </Tooltip.Content>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                      <span>{m.new_chat()}</span>
                    </a>
                  {/snippet}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
          </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
        <Sidebar.Group>
          <Sidebar.GroupLabel class="px-4 py-2 text-xs font-semibold uppercase text-gray-500">
            {m.chat_history()} 
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
        {@render children()}
    </main>

  </Sidebar.Provider>
</div>
