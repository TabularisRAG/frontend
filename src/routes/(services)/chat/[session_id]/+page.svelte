<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import Send from "@lucide/svelte/icons/send-horizontal";
  import Square from "@lucide/svelte/icons/square";
  import * as Card from "$lib/components/ui/card/index.js";
  import {m} from '$lib/paraglide/messages.js';
  import { onDestroy, onMount, setContext, tick } from "svelte";
  import { ChatMessageType, type Chat, type ChatMessageRequest, type Message } from "$lib/types/chat.js";
  import { type Model } from "$lib/types/model"
  import { page } from "$app/state";
  import { LoadEllipsis } from 'svelte-loading-animation';
  import { getContext } from 'svelte';
  import SvelteMarkdown from '@humanspeak/svelte-markdown'
  import CitationButton from "./CitationButton.svelte";
  import ModelSelectionDropdown from "../ModelSelectionDropdown.svelte";
  import HeadingRenderer from "$lib/components/HeadingRenderer.svelte";
  import ListRenderer from "$lib/components/ListRenderer.svelte";
  import TableRenderer from "$lib/components/TableRenderer.svelte";
  import TableHeadRenderer from "$lib/components/TableHeadRenderer.svelte";
  import TableBodyRenderer from "$lib/components/TableBodyRenderer.svelte";
  import TableCellRenderer from "$lib/components/TableCellRenderer.svelte";
  import TableRowRenderer from "$lib/components/TableRowRenderer.svelte";

  const WEB_SOCKET_BASE_URL = `ws://localhost:8000/api`;

  let scrollContainer: HTMLElement | null = $state(null);
  let {data} = $props();
  let messages: Message[] = $state(data.messages ?? []);
  let streamingMessage: Message | null = $state(null);
  let socket: WebSocket | null = null;
  let currentSessionId = $state(page.data.session_id);
  const availableModels = data.availableModels
  // svelte-ignore state_referenced_locally
  let selectedModel = $state<Model>(availableModels[0]);

  setContext('token', data.token ?? '');

  const { chatList: chatList, moveCurrentChatToFront } = getContext<{
    chatList: Chat[],
    moveCurrentChatToFront: (session_id: string) => void
  }>('chat');

  let userInput: Message = $state({
    type: ChatMessageType.HUMAN,
    value: '',
  } as Message);

  let displayMessages = $derived(
    streamingMessage ? [...messages, streamingMessage] : messages
  );

  $effect(() => {
    if (data.messages) {
      messages = data.messages;
    }
  });

  $effect(() => {
    if (currentSessionId !== page.data.session_id) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      streamingMessage = null;
      currentSessionId = page.data.session_id;
      initializeWebSocket();
    }
  });

  async function scrollToBottom() {
    if (!scrollContainer) return;
    await tick();
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }

  function initializeWebSocket() {
    const wsUrl = `${WEB_SOCKET_BASE_URL}/chats/${page.data.session_id}/ws?access_token=${data.token}`;
    socket = new WebSocket(wsUrl);

    let message = sessionStorage.getItem("initialMessage") ?? "";
    if(message.trim() !== ""){
      let firstMessage: Message = JSON.parse(message);
      sessionStorage.removeItem("initialMessage"); 
      selectedModel = availableModels.find((m) => m.id === firstMessage.model_id) ?? selectedModel;
      messages.push(firstMessage);

      let chatMessageRequest: ChatMessageRequest = {
        model_id: firstMessage.model_id,
        message: firstMessage.value,
        stop: false,
      }

      socket.onopen = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(chatMessageRequest));
        }
      }
    }

    socket.onmessage = async (event) => {
      try {
        const receivedMessage: Message = JSON.parse(event.data);
        if (currentSessionId === page.data.session_id) {
          handleReceivedMessage(receivedMessage);
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
    scrollToBottom();
  });

  function handleReceivedMessage(received_message: Message ) {
    switch (received_message.type) {
      case ChatMessageType.MESSAGE_RECEIVED:
        streamingMessage= {
            type: ChatMessageType.AI,
            value: '',
          } as Message;
        moveCurrentChatToFront(data.session_id);
        break;

      case ChatMessageType.UPDATE_CHATNAME:
        const newChat: Chat = {
          session_id: data.session_id,
          name: received_message.value,
          started_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
          url: `/chat/${data.session_id}`,
        }
        chatList.unshift(newChat);
        break;

      case ChatMessageType.TOKEN_GENERATED:
        if (streamingMessage) {
          streamingMessage.value += received_message.value ?? '';
          scrollToBottom();
        }
        break;

      case ChatMessageType.COMPLETION_GENERATED:
        if (streamingMessage) {
          messages.push(streamingMessage);
          scrollToBottom();
          streamingMessage= null;
        }
        break;

      case ChatMessageType.STOPPED:
        if (streamingMessage) {
          messages.push(streamingMessage);
          scrollToBottom();
          streamingMessage= null;
        }
        break;

      default:
        console.error("Unexpected message type");
        break;
    }
  }

  function sendMessage(event: Event) {
    event?.preventDefault();
    if (!userInput.value.trim() || !socket || socket.readyState !== WebSocket.OPEN) return;
    
    const newMessage =  {...userInput };;
    messages.push(newMessage);
    scrollToBottom();

    const payload = {
      message: userInput.value,
      model_id: selectedModel.id,
      stop: false,
    };

    socket.send(JSON.stringify(payload));
    userInput.value = "";
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      sendMessage(event as unknown as Event);
    }
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

  $effect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  });

  $effect(() => {
    if (streamingMessage !== null) {
      scrollToBottom();
    }
  });
</script>

{#key page.params.session_id}
  <div class="flex sticky flex-grow justify-center max-h-[calc(100vh-54px)]">
    <div bind:this={scrollContainer} class="h-full w-full px-28 rounded-md mt-2 overflow-y-auto">
      {#each displayMessages as message}
        {#if message.value !== ""}
          <div class="flex {message.type === ChatMessageType.HUMAN ? 'justify-end' : 'justify-start'} pb-2">
            <Card.Root class={message.type === ChatMessageType.HUMAN ? 'w-11/12 bg-gray-100 dark:bg-primary text-black' : 'w-full dark:bg-secondary dark:border-gray-700'}>
              <Card.Content class="max-h-fit">
                <SvelteMarkdown
                  source={message.value}
                  renderers={{ 
                    link: CitationButton,
                    heading: HeadingRenderer,
                    list: ListRenderer,
                    table: TableRenderer,
                    tablehead: TableHeadRenderer,
                    tablebody: TableBodyRenderer,
                    tablecell: TableCellRenderer,
                    tablerow: TableRowRenderer
                  }}
                />
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
      <div class="h-48"></div>
    </div>
  </div>
  <div class="sticky bottom-5 w-full px-28 pt-16 flex justify-center">
  <Card.Root class="w-full">
    <Card.Content class="w-full h-auto max-h-64 overflow-hidden">
      {#if !streamingMessage}
      <form class="flex w-full max-h-48 items-center space-x-2 pb-1" onsubmit={sendMessage}>
        <Textarea 
              bind:value={userInput.value}
              class="h-auto max-h-36 overflow-auto bg-white dark:bg-secondary" 
              placeholder={m.enter_prompt()}
              onkeydown={handleKeydown}
            />
        <Button type="submit">
          <Send />
        </Button>
      </form>
    {:else}
      <form class="flex w-full max-h-48 items-center space-x-2 pb-1" onsubmit={stopGeneration}>
        <Textarea disabled={true} class="h-auto  max-h-48 overflow-auto bg-white dark:bg-secondary" placeholder={m.enter_prompt()} />
        <Button type="submit" onsubmit={stopGeneration}>
          <Square />
        </Button>
      </form>
    {/if}
      <ModelSelectionDropdown {availableModels} bind:model={selectedModel}/>
    </Card.Content>
  </Card.Root>
  </div>
{/key}
