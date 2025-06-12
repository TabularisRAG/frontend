<script lang="ts">
    import type {ComponentProps} from "svelte";
    import {Button} from "$lib/components/ui/button";
    import {Input} from "$lib/components/ui/input";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import type {Column} from "@tanstack/table-core";
    import ArrowUpDown from "@lucide/svelte/icons/arrow-up-down";
    import ArrowUpAZ from "@lucide/svelte/icons/arrow-up-a-z";
    import ArrowDownZA from "@lucide/svelte/icons/arrow-down-z-a";
    import ListFilter from "@lucide/svelte/icons/list-filter";
    import ArrowUpWideNarrow from "@lucide/svelte/icons/arrow-up-wide-narrow";
    import ArrowDownWideNarrow from "@lucide/svelte/icons/arrow-down-wide-narrow";
    import Search from "@lucide/svelte/icons/search";
    import X from "@lucide/svelte/icons/x";
    import {m} from '$lib/paraglide/messages.js';


    let {title, column, filtering = true, sorting = true, ...restProps}: ComponentProps<typeof Button> & {
        title: string,
        filtering?: boolean,
        sorting?: boolean,
        column: Column<any, any>
    } = $props();

    let sortingState: "none" | "asc" | "desc" = $derived(!column.getIsSorted() ? "none" : column.getIsSorted() as "asc" | "desc");

    function changeSorting() {
        switch (sortingState) {
            case "none":
                column.clearSorting();
                break;
            case "asc":
                column.toggleSorting(false);
                break;
            case "desc":
                column.toggleSorting(true);
                break;
            default:
                break;
        }
    }

</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        {#snippet child({props})}
            <Button {...props} {...restProps} class="px-0! w-full justify-start cursor-pointer" variant="link">
                <span class="font-semibold">{title}</span>
                {#if filtering || sorting}
                    {#if column.getIsSorted() === "asc"}
                        {#if column.getIsFiltered()}
                            <ArrowUpWideNarrow/>
                        {:else}
                            <ArrowUpAZ/>
                        {/if}
                    {:else if column.getIsSorted() === "desc"}
                        {#if column.getIsFiltered()}
                            <ArrowDownWideNarrow/>
                        {:else}
                            <ArrowDownZA/>
                        {/if}
                    {:else}
                        {#if column.getIsFiltered()}
                            <ListFilter/>
                        {:else}
                            <ArrowUpDown/>
                        {/if}
                    {/if}
                {/if}
            </Button>
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="start">
        {#if filtering}
            <DropdownMenu.Group>
                <DropdownMenu.Label>{m["general.search"]()}</DropdownMenu.Label>
                <DropdownMenu.Separator/>
                <DropdownMenu.Label class="flex h-9 items-center gap-2">
                    <Search class="size-4 shrink-0 opacity-50"/>
                    <input class="placeholder:text-muted-foreground outline-hidden flex h-10 w-full rounded-md bg-transparent py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                           onchange={(e) => {column.setFilterValue(e.currentTarget.value)}}
                           oninput={(e) => {column.setFilterValue(e.currentTarget.value)}}
                           placeholder={m["general.search_placeholder"]()}
                           type="search"
                           value={column.getFilterValue() ?? ""}
                    />
                    {#if column.getIsFiltered()}
                        <Button variant="ghost" onclick={() => column.setFilterValue("")}>
                            <X class="size-4 shrink-0 opacity-50"/>
                            <span class="sr-only">{m["general.close"]()}</span>
                        </Button>
                    {/if}
                </DropdownMenu.Label>
            </DropdownMenu.Group>
        {/if}
        {#if filtering && sorting}
            <DropdownMenu.Separator/>
        {/if}
        {#if sorting}
            <DropdownMenu.Group>
                <DropdownMenu.Label>{m["general.sorting"]()}</DropdownMenu.Label>
                <DropdownMenu.Separator/>
                <DropdownMenu.RadioGroup bind:value={sortingState} onValueChange={() => changeSorting()}>
                    <DropdownMenu.RadioItem class="flex h-9 items-center gap-2" value="asc">
                        <ArrowUpAZ class="size-4 shrink-0"/>{m["general.table.ascending"]()}</DropdownMenu.RadioItem>
                    <DropdownMenu.RadioItem class="flex h-9 items-center gap-2" value="desc">
                        <ArrowDownZA class="size-4 shrink-0"/>{m["general.table.descending"]()}</DropdownMenu.RadioItem>
                    <DropdownMenu.RadioItem class="flex h-9 items-center gap-2" value="none">
                        <ArrowUpDown class="size-4 shrink-0"/>{m["general.table.none"]()}</DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>
            </DropdownMenu.Group>
        {/if}
    </DropdownMenu.Content>
</DropdownMenu.Root>