<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import Send from "@lucide/svelte/icons/send-horizontal";
  import * as Card from "$lib/components/ui/card/index.js";
  import {m} from '$lib/paraglide/messages.js';
  import { onDestroy, onMount, tick } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import type { ChatMessageRequest, Message } from "$lib/types/chat.js";
  import { page } from "$app/state";
  import { LoadEllipsis } from 'svelte-loading-animation';

  let scroll_container: HTMLElement | null;
  let {data} = $props();

  let user_input: Message = $state({
    type: 'human',
    value: '',
  });
  let model_id = "gpt-4-mini";
  const messages: Writable<Message[]> = writable(data.messages ?? []);
  let current_receiving_message: Message | null = $state(null);
  let socket: WebSocket;

  async function scrollToBottom() {
    if (!scroll_container) return;
    await tick();
    scroll_container.scrollTop = scroll_container.scrollHeight;
  }

  onMount(() => {
    let message = sessionStorage.getItem("initialMessage") ?? "";
    if(message.trim() === ""){
      return
    }

    let first_message: Message = JSON.parse(message);
    sessionStorage.removeItem("initialMessage"); 

    messages.update((msgs) => [...msgs, first_message]);
    scrollToBottom();
    const wsUrl = `ws://localhost:8000/api/chats/${page.data.sessionId}/ws`;
    socket = new WebSocket(wsUrl);

    let chat_message_request: ChatMessageRequest = {
      model_id: "gpt-4o-mini",
      message: message,
      stop: false,
    }
      

    socket.onopen = () => {
      socket!.send(JSON.stringify(chat_message_request));
    }

    socket.onmessage = (event) => {
      try {
        const received_message: Message = JSON.parse(event.data);
        if (received_message.type === 'message_received') {
          current_receiving_message = {
            type: 'ai',
            value: '',
          };
        } else if (received_message.type === 'token_generated' && current_receiving_message) {
          current_receiving_message.value += received_message.value;
        } else if (received_message.type === 'completion_generated' && current_receiving_message) {
          messages.update((msgs) => [...msgs, current_receiving_message!]);
          scrollToBottom();
          current_receiving_message = null;
        }
      } catch (error) {
        console.error("Error while processing the received message:", error);
      }
    };
  });

  function sendMessage() {
    event?.preventDefault();
    if (!user_input.value.trim()) return;
    const new_message =  {...user_input };;
    messages.update((msgs) => [...msgs, new_message]);
    scrollToBottom();
    const payload = {
      message: user_input.value,
      model_id: model_id,
      stop: false,
    };
    socket.send(JSON.stringify(payload));
    user_input.value = "";
  }


  function stopGeneration() {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const stopPayload = { stop: true };
      socket.send(JSON.stringify(stopPayload));
    }
  }

  onDestroy(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  });

  $effect.pre(() => {
    $messages;
    current_receiving_message;
    scrollToBottom();
  });
</script>

<div class="flex sticky flex-grow justify-center max-h-[calc(100vh-54px)]">
 <div bind:this={scroll_container} class="h-full w-5/6 rounded-md mt-2 overflow-y-auto">
    {#each $messages as message}
      <div class="flex {message.type === 'human' ? 'justify-end' : 'justify-start'} pb-2">
        <Card.Root class="w-11/12 {message.type === 'human' ? 'bg-gray-100' : ''}">
          <Card.Content class="max-h-fit">
            <p class="text-gray-800">{message.value}</p>
          </Card.Content>
        </Card.Root>
      </div>
    {/each}
    {#if current_receiving_message !== null}
      <Card.Root class="w-24">
        <Card.Content class="max-h-fit">
          <div class="flex justify-center">
            <LoadEllipsis size="24px" color="#555" />
          </div>
        </Card.Content>
      </Card.Root>
    {/if}
    <div class="h-46"></div>
  </div>
</div>
<div class="sticky bottom-5 w-full flex justify-center">
  <Card.Root class="w-5/6">
    <Card.Content class="max-h-fit">
      <form class="flex w-full max-h-48 items-center space-x-2" onsubmit={sendMessage}>
        <Textarea bind:value={user_input.value} class="h-fit max-h-36 overflow-auto" placeholder={m.enter_prompt()} />
        <Button type="submit">
          <Send />
        </Button>
      </form>
    </Card.Content>
    <Card.Footer>
    </Card.Footer>
  </Card.Root>
</div>
