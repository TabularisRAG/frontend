<script lang="ts">
    import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
    import {Button} from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import {m} from '$lib/paraglide/messages';
    import Eye from "@lucide/svelte/icons/eye";
    import Pencil from "@lucide/svelte/icons/pencil";
    import Trash from "@lucide/svelte/icons/trash";

    let {id}: { id: string } = $props();
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        {#snippet child({props})}
            <Button
                    {...props}
                    variant="ghost"
                    size="icon"
                    class="relative size-8 p-0"
            >
                <span class="sr-only">{m['general.actions']()}</span>
                <EllipsisIcon/>
            </Button>
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        <DropdownMenu.Group>
            <DropdownMenu.Label>{m['general.actions']()}</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>
                {#snippet child({props})}
                    <a href="/documents/{id}" {...props}>
                        <Eye class="mr-1 text-foreground"/>
                        {m['general.view']()}
                    </a>
                {/snippet}
            </DropdownMenu.Item>
            <DropdownMenu.Item>
                {#snippet child({props})}
                    <a href="/documents/{id}/edit" {...props}>
                        <Pencil class="mr-1 text-foreground"/>
                        {m['general.edit']()}
                    </a>
                {/snippet}
            </DropdownMenu.Item>
            <DropdownMenu.Item onclick={()=> console.log("deleting " + id)}>
                <Trash class="mr-1 text-foreground"/>
                {m['general.delete']()}
            </DropdownMenu.Item>
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>