<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import Send from "@lucide/svelte/icons/send-horizontal";
  import CirclePlus from "@lucide/svelte/icons/circle-plus";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import CustomSidebarTrigger from "$lib/components/ui/custom_sidebar_trigger.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import {m} from '$lib/paraglide/messages.js';
  import { onDestroy } from "svelte";
  import { writable, type Writable } from "svelte/store";

  type ChatMessageType =
  | "update_chatname"
  | "stopped"
  | "error"
  | "message_received"
  | "connection_error"
  | "token_generated"
  | "completion_generated"
  | "ai"
  | "human";

  interface ChatMessageResponse {
    model_id?: string;
    value?: string;
    type?: ChatMessageType;
  }

  // 1. Props vom Server (aus +page.server.ts)
  export let data: {
    sessionId: string;
    chatName: string;
    startedAt?: string;
    lastMessageAt?: string;
    messages: { type: string; value: string; modelId?: string }[];
  };

  // 2. Svelte-Store, der unseren Verlauf hält (initial befüllt mit data.messages)
  type Message = { type: string; value: string; modelId?: string };
  const messages: Writable<Message[]> = writable(data.messages);

  // 3. WebSocket-Referenz (zuerst null, bauen wir beim ersten Senden auf)
  let socket: WebSocket | null = null;

  // 4. Lokale Eingabe-Felder
  let userInput = "";
  let modelId = "gpt-4"; // Beispiel-Default, kannst du auswählbar machen

  // 5. sendMessage(): baut den WS auf (falls nötig) und schickt Payload
  function sendMessage() {
    if (!userInput.trim()) return;

    // 5.1. WS-Verbindung nur beim ersten Senden initialisieren
    if (!socket) {
      const wsUrl = `ws://localhost:8000/chat/${data.sessionId}/ws`;
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("WebSocket verbunden");
        // Sobald offen: erster Payload wird nun geschickt
        const payload = {
          message: userInput,
          model_id: modelId,
          stop: false,
        };
        socket!.send(JSON.stringify(payload));

        // Eigene Nachricht sofort ins UI einfügen (optimistisch)
        messages.update((arr) => [
          ...arr,
          { type: "human", value: userInput },
        ]);
        userInput = "";
      };

      // 5.2. Eingehende WS-Nachrichten verarbeiten
      socket.onmessage = (event) => {
        try {
          const msg: ChatMessageResponse = JSON.parse(event.data);
          // msg.type, msg.value, msg.model_id
          messages.update((arr) => [
            ...arr,
            { type: msg.type ?? "error", value: msg.value ?? "", modelId: msg.model_id },
          ]);
        } catch (e) {
          console.error("Ungültiges WS-Event:", e);
        }
      };

      socket.onerror = (e) => {
        console.error("WebSocket-Fehler:", e);
      };

      socket.onclose = (e) => {
        console.log("WebSocket geschlossen", e);
        socket = null;
      };
    } else {
      // 5.3. Wenn WS bereits offen ist, Payload direkt abschicken
      const payload = {
        message: userInput,
        model_id: modelId,
        stop: false,
      };
      socket.send(JSON.stringify(payload));
      messages.update((arr) => [
        ...arr,
        { type: "human", value: userInput },
      ]);
      userInput = "";
    }
  }

  // 6. Stoppen-Funktion: sendet { stop: true }
  function stopGeneration() {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const stopPayload = { stop: true };
      socket.send(JSON.stringify(stopPayload));
    }
  }

  // 7. Aufräumen, wenn Komponente zerstört wird
  onDestroy(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  });
</script>

<div class="flex sticky flex-grow justify-center max-h-[calc(100vh-54px)]">
  <ScrollArea class="h-full w-5/6 rounded-md">
    <div class="p-4">

    </div>
  </ScrollArea>
</div>
<div class="sticky bottom-5 w-full flex justify-center">
  <Card.Root class="w-5/6">
    <Card.Content class="max-h-fit">
      <form class="flex w-full max-h-48 items-center space-x-2"
        on:submit|preventDefault={sendMessage}>
        <Textarea class="h-fit max-h-36 overflow-auto" placeholder={m.enter_prompt()} />
        <Button type="submit">
          <Send />
        </Button>
      </form>
    </Card.Content>
    <Card.Footer>
    </Card.Footer>
  </Card.Root>
</div>
