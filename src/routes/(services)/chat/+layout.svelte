<script lang="ts">
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import CirclePlus from "@lucide/svelte/icons/circle-plus";
  import Ellipsis from "@lucide/svelte/icons/ellipsis";
  import X from "@lucide/svelte/icons/x";
  import Check from "@lucide/svelte/icons/check";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import CustomSidebarTrigger from "$lib/components/ui/custom_sidebar_trigger.svelte";
  import {m} from '$lib/paraglide/messages.js';
  import { setContext, tick } from 'svelte';
  import type { Chat } from '$lib/types/chat';
  import ChatAPI from "$lib/api/chatAPI/chatAPI";
  import type { UUID } from "crypto";

  let { data, children } = $props();
  let open = $state(true);
  const chat_list = $state(data.chat_list);
  let editing_id: string | null = $state(null);
  let new_name = $state('');

  function move_current_chat_to_front(session_id: string) {
      if (chat_list[0]?.session_id === session_id) {
        return;
      }
    const idx = chat_list.findIndex(chat => chat.session_id === session_id);
    if (idx === -1) return;
    [chat_list[idx], chat_list[0]] = [chat_list[0], chat_list[idx]];
  }
  setContext('chat', { chat_list, move_current_chat_to_front });

  async function start_rename(chat: Chat) {
    editing_id = chat.session_id;
    new_name = chat.name;

    await tick(); 

    requestAnimationFrame(() => {
      const input = document.getElementById(`rename-${editing_id}`) as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.select();
      }
    });
}

  function cancel_rename() {
    editing_id = null;
    new_name = '';
  }

  async function confirm_rename(session_id: UUID) {
    const response = await new ChatAPI().rename_chat(session_id, new_name, data.token)
    const chat = chat_list.find((c) => c.session_id === session_id);
    if (chat) {
      chat.name = new_name.trim();
    } 
    else {
      console.error('Rename failed', await response.text());
    }
    cancel_rename();
  }

  function delete_chat(chat_id: UUID) {
    const response = new ChatAPI().delete_chat(chat_id, data.token)
  }

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
            <Sidebar.Menu>
              {#if open}
                {#each chat_list as chat}
                  {#if editing_id === chat.session_id}
                    <div class="flex flex-row">
                    <div class="pl-2 pr-2 py-1 h-full w-full rounded">
                      <input
                        id={"rename-" + chat.session_id}
                        class="w-full border rounded"
                        bind:value={new_name}
                        onkeyup={(e) => e.key === 'Enter' && confirm_rename(chat.session_id)}
                        onkeydown={(e) => e.key === 'Escape' && cancel_rename()}
                      />
                    </div> 
                    <Tooltip.Provider>
                      <Tooltip.Root>
                        <Tooltip.Trigger>
                          <button class="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200" onclick={() => confirm_rename(chat.session_id)}>
                            <Check size={14} />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          <p>{m.confirm}</p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </Tooltip.Provider>

                    <Tooltip.Provider>
                      <Tooltip.Root>
                        <Tooltip.Trigger>
                          <button class="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200" onclick={() => cancel_rename()}>
                            <X size={14} />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          <p>{m.cancel}</p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                    </div>
                  {:else}
                    <Tooltip.Provider>
                      <Tooltip.Root>
                        <Tooltip.Trigger>
                          <Sidebar.MenuItem>
                            <Sidebar.MenuButton>
                              {#snippet child({ props })}
                                <a href={chat.url} {...props}>
                                  <span>{chat.name}</span>
                                </a>
                              {/snippet}
                            </Sidebar.MenuButton>
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger>
                                {#snippet child({ props })}
                                  <Sidebar.MenuAction {...props}>
                                    <Ellipsis />
                                  </Sidebar.MenuAction>
                                {/snippet}
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Content side="right" align="start">
                                <DropdownMenu.Item onSelect={() => {
                                  requestAnimationFrame(() => start_rename(chat));
                                }}>
                                  {m.rename()}
                                </DropdownMenu.Item>
                                <DropdownMenu.Item onSelect={() => delete_chat(chat.session_id)}>
                                  {m.delete()}
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Root>
                          </Sidebar.MenuItem>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          <p>{chat.name}</p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  {/if}
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
