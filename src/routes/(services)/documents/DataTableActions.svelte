<script lang="ts">
    import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
    import {Button} from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import {m} from '$lib/paraglide/messages';
    import Eye from "@lucide/svelte/icons/eye";
    import Pencil from "@lucide/svelte/icons/pencil";
    import Trash from "@lucide/svelte/icons/trash";
    import {page} from "$app/state";
    import {invalidateAll} from "$app/navigation";
    import {DocumentAPI} from "$lib/api/DocumentAPI";
    import {SESSION_COOKIE_NAME} from "$lib/api/AuthenticationAPI";

    let {id, token}: { id: string, token: string } = $props();

    async function deleteDocument() {
        console.log("delete " + id)
        await new DocumentAPI().deleteDocument(token, id)
        await invalidateAll()
    }
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
                <span class="sr-only">{m.label_actions()}</span>
                <EllipsisIcon/>
            </Button>
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        <DropdownMenu.Group>
            <DropdownMenu.Label>{m.label_actions()}</DropdownMenu.Label>
            <DropdownMenu.Separator/>
            <DropdownMenu.Item>
                {#snippet child({props})}
                    <a href="/documents/{id}" {...props}>
                        <Eye class="mr-1 text-foreground"/>
                        {m.action_view()}
                    </a>
                {/snippet}
            </DropdownMenu.Item>
            <!--            <DropdownMenu.Item>-->
            <!--                {#snippet child({props})}-->
            <!--                    <a href="/documents/{id}/edit" {...props}>-->
            <!--                        <Pencil class="mr-1 text-foreground"/>-->
            <!--                        {m.action_edit()}-->
            <!--                    </a>-->
            <!--                {/snippet}-->
            <!--            </DropdownMenu.Item>-->
            <DropdownMenu.Item onclick={async () => await deleteDocument()}>
                <Trash class="mr-1 text-foreground"/>
                {m.action_delete()}
            </DropdownMenu.Item>
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>