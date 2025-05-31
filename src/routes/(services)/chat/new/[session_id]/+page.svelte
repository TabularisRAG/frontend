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


  let { data } = $props();
  const chats: any[] = [
      {
      title: "Home",
      url: "#",
      icon: CirclePlus,
    },
  ];
  let open = $state(true);
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
      <form class="flex w-full max-h-48 items-center space-x-2">
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
