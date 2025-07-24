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
  const available_models = $derived(data.available_models)
  // svelte-ignore state_referenced_locally
  let selected_model = $state<Model>(available_models[0]);
  let message_value = $state<string>("");

  let message: Message = $derived({
    type: ChatMessageType.HUMAN,
    value: message_value,
    model_id:selected_model.id
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (!message.value.trim()) return;
  
    let chat_message_request: ChatMessageRequest = {
      model_id: message.model_id,
      message: message.value,
      stop: false,
    }

    const new_chat = await new ChatAPI().create_new_chat(data.token, chat_message_request); 
    const chat_id = new_chat.session_id;

    sessionStorage.setItem("initialMessage", JSON.stringify(message));
    goto(`/chat/${chat_id}`);
  }

</script>

<div class="flex h-full items-center justify-center w-full ">
  <Card.Root class="h-44 w-5/6">
    <Card.Content class="max-h-fit">
      <form class="flex pb-2 w-full max-h-48 items-center space-x-2" onsubmit={handleSubmit}> 
        <Textarea bind:value={message_value} class="h-24 overflow-auto" placeholder={m.enter_prompt()} />
        <Button type="submit">
          <Send />
        </Button>
      </form>
      <ModelSelectionDropdown {available_models} bind:model={selected_model} />
    </Card.Content>
    <Card.Footer>
    </Card.Footer>
  </Card.Root>
</div>
