<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import Send from "@lucide/svelte/icons/send-horizontal";
  import * as Card from "$lib/components/ui/card/index.js";
  import {m} from '$lib/paraglide/messages.js';
  import { onDestroy, onMount, tick } from "svelte";
  import { ChatMessageType, type Chat, type ChatMessageRequest, type Message } from "$lib/types/chat.js";
  import { page } from "$app/state";
  import { LoadEllipsis } from 'svelte-loading-animation';
  import { getContext } from 'svelte';
  import SvelteMarkdown from '@humanspeak/svelte-markdown'

  //will be made selectable by user 
  const MODEL_ID = "gpt-4-mini";
  const WEB_SOCKET_URL = `ws://localhost:8000/api/chats/${page.data.session_id}/ws`;

  let scroll_container: HTMLElement | null = $state(null);
  let {data} = $props();
  let messages: Message[] = $state(data.messages ?? []);
  let streaming_message: Message | null = $state(null);
  let socket: WebSocket | null = null;
  let current_session_id = $state(page.data.session_id);

  const { chat_list, move_current_chat_to_front } = getContext<{
    chat_list: import('svelte/store').Writable<Chat[]>,
    move_current_chat_to_front: (session_id: string) => void
  }>('chat');

  let user_input: Message = $state({
    type: ChatMessageType.HUMAN,
    value: '',
  });

  let display_messages = $derived(
    streaming_message ? [...messages, streaming_message] : messages
  );

  $effect(() => {
    if (data.messages) {
      messages = data.messages;
    }
  });

  $effect(() => {
    if (current_session_id !== page.data.session_id) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      streaming_message = null;
      current_session_id = page.data.session_id;
      initializeWebSocket();
    }
  });

  async function scroll_to_bottom() {
    if (!scroll_container) return;
    await tick();
    scroll_container.scrollTop = scroll_container.scrollHeight;
  }

  function initializeWebSocket() {
    socket = new WebSocket(WEB_SOCKET_URL);

    let message = sessionStorage.getItem("initialMessage") ?? "";
    if(message.trim() !== ""){
      let first_message: Message = JSON.parse(message);
      sessionStorage.removeItem("initialMessage"); 

      messages.push(first_message);

      let chat_message_request: ChatMessageRequest = {
        model_id: MODEL_ID,
        message: message,
        stop: false,
      }

      socket.onopen = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(chat_message_request));
        }
      }
    }

    socket.onmessage = async (event) => {
      try {
        const received_message: Message = JSON.parse(event.data);
        if (current_session_id === page.data.session_id) {
          handle_received_message(received_message);
        }
      } catch (error) {
        console.error("Error while processing the received message:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  onMount(() => {
    initializeWebSocket();
    scroll_to_bottom();
  });

  function handle_received_message(received_message: Message ) {
    switch (received_message.type) {
      case ChatMessageType.MESSAGE_RECEIVED:
        streaming_message= {
            type: ChatMessageType.AI,
            value: '',
          };
        move_current_chat_to_front(data.session_id);
        break;

      case ChatMessageType.UPDATE_CHATNAME:
        const new_chat: Chat = {
          session_id: data.session_id,
          name: received_message.value,
          started_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
          url: `/chat/${data.session_id}`,
        }
        chat_list.update(list => [new_chat, ...list]);
        break;

      case ChatMessageType.TOKEN_GENERATED:
        if (streaming_message) {
          streaming_message.value += received_message.value ?? '';
          scroll_to_bottom();
        }
        break;

      case ChatMessageType.COMPLETION_GENERATED:
        if (streaming_message) {
          messages.push(streaming_message);
          scroll_to_bottom();
          streaming_message= null;
        }
        break;

      default:
        console.error("Unexpected message type");
        break;
    }
  }

  function send_message(event: Event) {
    event?.preventDefault();
    if (!user_input.value.trim() || !socket || socket.readyState !== WebSocket.OPEN) return;
    
    const new_message =  {...user_input };;
    messages.push(new_message);
    scroll_to_bottom();

    const payload = {
      message: user_input.value,
      model_id: MODEL_ID,
      stop: false,
    };

    socket.send(JSON.stringify(payload));
    user_input.value = "";
  }


  function stop_generation() {
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

  $effect(() => {
    if (messages.length > 0) {
      scroll_to_bottom();
    }
  });

  $effect(() => {
    if (streaming_message !== null) {
      scroll_to_bottom();
    }
  });
</script>

{#key page.params.session_id}
<div class="flex sticky flex-grow justify-center max-h-[calc(100vh-54px)]">
    <div bind:this={scroll_container} class="h-full w-full px-28 rounded-md mt-2 overflow-y-auto">
      {#each display_messages as message}
        {#if message.value !== ""}
          <div class="flex {message.type === ChatMessageType.HUMAN ? 'justify-end' : 'justify-start'} pb-2">
            <Card.Root class={message.type === ChatMessageType.HUMAN ? 'w-11/12 bg-gray-100 dark:bg-primary text-black' : 'w-full dark:bg-secondary dark:border-gray-700'}>
              <Card.Content class="max-h-fit">
                <SvelteMarkdown source={message.value} />
              </Card.Content>
            </Card.Root>
          </div>
        {:else}
          <Card.Root class="w-24">
            <Card.Content class="max-h-fit">
              <div class="flex justify-center">
                <LoadEllipsis size="24px" color="#555" />
              </div>
            </Card.Content>
          </Card.Root>
        {/if}
      {/each}
    <div class="h-46"></div>
  </div>
</div>
<div class="sticky bottom-5 w-full px-28 flex justify-center">
  <Card.Root class="w-full">
    <Card.Content class="max-h-fit">
      <form class="flex w-full max-h-48 items-center space-x-2" onsubmit={send_message}>
        <Textarea bind:value={user_input.value} class="h-fit max-h-36 overflow-auto bg-white dark_bg-secondary" placeholder={m.enter_prompt()} />
        <Button type="submit">
          <Send />
        </Button>
      </form>
    </Card.Content>
    <Card.Footer>
    </Card.Footer>
  </Card.Root>
</div>
{/key}
