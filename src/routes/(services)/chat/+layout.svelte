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
  import {invalidateAll} from "$app/navigation";

  let { data, children } = $props();
  let open = $state(true);
  let chatList = $state(data.chatList);
  let editingId: string | null = $state(null);
  let newName = $state('');

  function moveCurrentChatToFront(session_id: string) {
      if (chatList[0]?.session_id === session_id) {
        return;
      }
    const idx = chatList.findIndex(chat => chat.session_id === session_id);
    if (idx === -1) return;
    [chatList[idx], chatList[0]] = [chatList[0], chatList[idx]];
  }
  setContext('chat', { chatList, moveCurrentChatToFront });

  async function startRename(chat: Chat) {
    editingId = chat.session_id;
    newName = chat.name;

    await tick(); 

    requestAnimationFrame(() => {
      const input = document.getElementById(`rename-${editingId}`) as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.select();
      }
    });
}

  function cancelRename() {
    editingId = null;
    newName = '';
  }

  async function confirmRename(session_id: UUID) {
    try {
      const response = await new ChatAPI().renameChat(session_id, newName, data.token)
      const chat = chatList.find((c) => c.session_id === session_id);
      if (chat) {
        chat.name = newName.trim();
      } 
    }
    catch (e) {
      console.error('Rename failed: ' + e);
    }
    cancelRename();
  }

  function deleteChat(chatId: UUID) {
    new ChatAPI().deleteChat(chatId, data.token);
    chatList = chatList.filter(chat => chat.session_id !== chatId);
    invalidateAll();
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
                    <a href="/chat/new" {...props}>
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
                {#each chatList as chat}
                  {#if editingId === chat.session_id}
                    <div class="flex flex-row">
                    <div class="pl-2 pr-2 py-1 h-full w-full rounded">
                      <input
                        id={"rename-" + chat.session_id}
                        class="w-full border rounded"
                        bind:value={newName}
                        onkeyup={(e) => e.key === 'Enter' && confirmRename(chat.session_id)}
                        onkeydown={(e) => e.key === 'Escape' && cancelRename()}
                      />
                    </div> 
                    <Tooltip.Provider>
                      <Tooltip.Root>
                        <Tooltip.Trigger>
                          <button class="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200" onclick={() => confirmRename(chat.session_id)}>
                            <Check size={14} />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          <p>{m.confirm()}</p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </Tooltip.Provider>

                    <Tooltip.Provider>
                      <Tooltip.Root>
                        <Tooltip.Trigger>
                          <button class="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200" onclick={() => cancelRename()}>
                            <X size={14} />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          <p>{m.cancel()}</p>
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
                                  requestAnimationFrame(() => startRename(chat));
                                }}>
                                  {m.rename()}
                                </DropdownMenu.Item>
                                <DropdownMenu.Item onSelect={() => deleteChat(chat.session_id)}>
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
