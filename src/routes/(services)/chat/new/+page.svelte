<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import Send from "@lucide/svelte/icons/send-horizontal";
  import * as Card from "$lib/components/ui/card/index.js";
  import {m} from '$lib/paraglide/messages.js';
  import { goto } from "$app/navigation";
  import type { Message } from "$lib/types/chat.js";
  

  let message: Message = {
    type: 'human',
    value:'',
  };

  async function handleSubmit(event: Event) {
    if (!message.value.trim()) return;

    const response = await fetch('http://localhost:8000/api/chats/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    const chat_id = data.session_id;

    sessionStorage.setItem("initialMessage", JSON.stringify(message));
    goto(`/chat/${chat_id}`);
  }

</script>

<div class="flex h-full items-center justify-center w-full ">
  <Card.Root class="h-40 w-5/6">
    <Card.Content class="max-h-fit">
      <form class="flex w-full max-h-48 items-center space-x-2" on:submit|preventDefault={handleSubmit}> 
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
