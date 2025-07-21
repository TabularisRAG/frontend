<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import Send from "@lucide/svelte/icons/send-horizontal";
  import * as Card from "$lib/components/ui/card/index.js";
  import {m} from '$lib/paraglide/messages.js';
  import { goto } from "$app/navigation";
  import { ChatMessageType, type ChatMessageRequest, type Message } from "$lib/types/chat.js";
  import ChatAPI from "$lib/api/chatAPI/chatAPI.js";
 
  let {data} = $props();
  
  let message: Message = {
    type: ChatMessageType.HUMAN,
    value:'',
  };

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (!message.value.trim()) return;
  
    let chat_message_request: ChatMessageRequest = {
      model_id: "22dd6109-e513-465a-9593-506e7d97e77e",
      message: message.value,
      stop: false,
    }

    const chat_API = new ChatAPI();

    const new_chat = await chat_API.create_new_chat(data.token, chat_message_request); 
    const chat_id = new_chat.session_id;

    sessionStorage.setItem("initialMessage", JSON.stringify(message));
    goto(`/chat/${chat_id}`);
  }

</script>

<div class="flex h-full items-center justify-center w-full ">
  <Card.Root class="h-40 w-5/6">
    <Card.Content class="max-h-fit">
      <form class="flex w-full max-h-48 items-center space-x-2" onsubmit={handleSubmit}> 
        <Textarea bind:value={message.value} class="h-24 overflow-auto" placeholder={m.enter_prompt()} />
        <Button type="submit">
          <Send />
        </Button>
      </form>
    </Card.Content>
    <Card.Footer>
    </Card.Footer>
  </Card.Root>
</div>
