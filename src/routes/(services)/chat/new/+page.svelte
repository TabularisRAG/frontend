<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import Send from "@lucide/svelte/icons/send-horizontal";
  import * as Card from "$lib/components/ui/card/index.js";
  import {m} from '$lib/paraglide/messages.js';
  import { goto } from "$app/navigation";
    import type { ChatMessageRequest } from "$lib/types/chat";
  

  let message: string = "";

  async function handleSubmit(event: Event) {

    const response = await fetch('http://localhost:8000/api/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    const chat_id = data.id;

    let socket: WebSocket | null = null;
    const wsUrl = `ws://localhost:8000/chat/${data.sessionId}/ws`;
    socket = new WebSocket(wsUrl);

    let chat_message_request: ChatMessageRequest = {
      model_id: "gpt-4o-mini",
      message: message,
      stop: false,
    }
      

    socket.onopen = () => {
      const payload = chat_message_request
      socket!.send(JSON.stringify(payload));
      goto(`/chat/${chat_id}`);
    }
  }

</script>

<div class="flex h-full items-center justify-center w-full ">
  <Card.Root class="h-1/3 w-5/6">
    <Card.Content class="max-h-fit">
      <form class="flex w-full max-h-48 items-center space-x-2" on:submit|preventDefault={handleSubmit}> 
        <Textarea bind:value={message} class="h-36 overflow-auto" placeholder={m.enter_prompt()} />
        <Button type="submit">
          <Send />
        </Button>
      </form>
    </Card.Content>
    <Card.Footer>
    </Card.Footer>
  </Card.Root>
</div>
