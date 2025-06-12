<script generics="TData, TValue" lang="ts">
    import {m} from '$lib/paraglide/messages.js';
    import {
        type ColumnDef,
        type ColumnFiltersState,
        getCoreRowModel, getFilteredRowModel,
        getSortedRowModel,
        type SortingState, type VisibilityState
    } from "@tanstack/table-core";
    import {
        createSvelteTable,
        FlexRender,
    } from "$lib/components/ui/data-table";
    import * as Table from "$lib/components/ui/table";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import {goto} from "$app/navigation";
    import {Button} from "$lib/components/ui/button";
    import CirclePlus from "@lucide/svelte/icons/circle-plus";
    import Columns3 from "@lucide/svelte/icons/columns-3";
    import ScreenSize from "$lib/components/ScreenSize.svelte";
    import {onMount} from "svelte";

    type DataTableProps<TData, TValue> = {
        columns: ColumnDef<TData, TValue>[];
        data: TData[];
    };

    let {data, columns}: DataTableProps<TData, TValue> = $props();
    let sorting = $state<SortingState>([]);
    let columnFilters = $state<ColumnFiltersState>([])
    let columnVisibility = $state<VisibilityState>({});

    let columIdNameMap: { [key: string]: string } = {
        title: m['pages.documents.title'](),
        author: m['pages.documents.author'](),
        year: m['pages.documents.year'](),
        keywords: m['pages.documents.keywords'](),
        uploadedAt: m['pages.documents.uploadedAt'](),
        sizeInBytes: m['pages.documents.size']()
    }

    const table = createSvelteTable({
        get data() {
            return data;
        },
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: (updater) => {
            if (typeof updater === "function") {
                sorting = updater(sorting);
            } else {
                sorting = updater;
            }
        },
        onColumnFiltersChange: (updater) => {
            if (typeof updater === "function") {
                columnFilters = updater(columnFilters);
            } else {
                columnFilters = updater;
            }
        },
        onColumnVisibilityChange: (updater) => {
            if (typeof updater === "function") {
                columnVisibility = updater(columnVisibility);
            } else {
                columnVisibility = updater;
            }
        },
        state: {
            get sorting() {
                return sorting;
            },
            get columnFilters() {
                return columnFilters;
            },
            get columnVisibility() {
                return columnVisibility;
            },
        }
    });

    let isSm = $state(false);
    let isMd = $state(false);

    onMount(() => {
        table.getAllColumns().forEach((col) => {
            if (!isSm && col.id === "keywords" && col.getIsVisible()) {
                col.toggleVisibility(false);
            } else if (isSm && col.id === "keywords" && !col.getIsVisible()) {
                col.toggleVisibility(true);
            }
            if (!isMd && (col.id === "sizeInBytes" || col.id === "uploadedAt") && col.getIsVisible()) {
                col.toggleVisibility(false);
            } else if (isMd && (col.id === "uploadedAt" || col.id === "sizeInBytes") && !col.getIsVisible()) {
                col.toggleVisibility(true);
            }
        })
    })

</script>
<ScreenSize bind:isMd bind:isSm/>
<div class="flex flex-col gap-4">
    <div class="flex flex-row justify-end">
        <div class="flex flex-row gap-4">
            <Button href="/documents/add">
                <CirclePlus/>
                {m['general.add']()}
            </Button>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    {#snippet child({props})}
                        <Button {...props} variant="outline">
                            <Columns3/>
                            {m['general.columns']()}
                        </Button>
                    {/snippet}
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                    {#each table
                        .getAllColumns()
                        .filter((col) => col.getCanHide()) as column (column.id)}
                        <DropdownMenu.CheckboxItem
                                class="capitalize"
                                bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
                        >
                            {columIdNameMap[column.id] ?? column.id}
                        </DropdownMenu.CheckboxItem>
                    {/each}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    </div>
    <div class="border rounded-md">
        <Table.Root>
            <Table.Header>
                {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
                    <Table.Row>
                        {#each headerGroup.headers as header (header.id)}
                            <Table.Head>
                                {#if !header.isPlaceholder}
                                    <FlexRender
                                            content={header.column.columnDef.header}
                                            context={header.getContext()}
                                    />
                                {/if}
                            </Table.Head>
                        {/each}
                    </Table.Row>
                {/each}
            </Table.Header>
            <Table.Body>
                {#each table.getRowModel().rows as row (row.id)}
                    <Table.Row class="hover:cursor-pointer"
                               data-state={row.getIsSelected() && "selected"}
                               onclick={() => goto(`/documents/${row.original.id}`)}>
                        {#each row.getVisibleCells() as cell (cell.id)}
                            <Table.Cell>
                                <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()}/>
                            </Table.Cell>
                        {/each}
                    </Table.Row>
                {:else}
                    <Table.Row>
                        <Table.Cell colspan={columns.length} class="h-24 text-center">
                            {m['general.no_results']()}
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
</div>
