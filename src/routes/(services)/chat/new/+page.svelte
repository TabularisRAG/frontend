<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import Send from "@lucide/svelte/icons/send-horizontal";
  import * as Card from "$lib/components/ui/card/index.js";
  import {m} from '$lib/paraglide/messages';
  import { goto } from "$app/navigation";
  import { ChatMessageType, type ChatMessageRequest, type Message } from "$lib/types/chat";
  import { type Model} from "$lib/types/model";
  import ChatAPI from "$lib/api/chatAPI/chatAPI.js";
  import ModelSelectionDropdown from "../ModelSelectionDropdown.svelte";
 
  let {data} = $props();
  const availableModels = $derived(data.availableModels)
  // svelte-ignore state_referenced_locally
  let selectedModel = $state<Model>(availableModels[0]);
  let messageValue = $state<string>("");

  let message: Message = $derived({
    type: ChatMessageType.HUMAN,
    value: messageValue,
    model_id:selectedModel?.id
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      handleSubmit(event as unknown as Event);
    }
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (!message.value.trim()) return;
  
    let chatMessageRequest: ChatMessageRequest = {
      model_id: message.model_id,
      message: message.value,
      stop: false,
    }

    const newChat = await new ChatAPI().createNewChat(data.token, chatMessageRequest); 
    const chatId = newChat.session_id;

    sessionStorage.setItem("initialMessage", JSON.stringify(message));
    goto(`/chat/${chatId}`);
  }

</script>

<div class="flex flex-col h-full items-center justify-center w-full pb-20">
  <div
    class="flex items-center justify-center
           pointer-events-none select-none
           lg:text-9xl text-7xl text-gray-200 dark:text-gray-600 mb-10"
  >
    TabulaRAG
  </div>
  <Card.Root class="h-44 w-5/6">
    <Card.Content class="max-h-fit">
      <form class="flex pb-2 w-full max-h-48 items-center space-x-2" onsubmit={handleSubmit}> 
        <Textarea 
              bind:value={messageValue}
              class="h-fit  max-h-24 overflow-auto bg-white dark_bg-secondary" 
              placeholder={m.enter_prompt()}
              onkeydown={handleKeydown}
            />
        <Button type="submit">
          <Send />
        </Button>
      </form>
      <ModelSelectionDropdown {availableModels} bind:model={selectedModel} />
    </Card.Content>
    <Card.Footer>
    </Card.Footer>
  </Card.Root>
</div>
