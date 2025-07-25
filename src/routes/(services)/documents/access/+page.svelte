<script lang="ts">
    import * as TransferList from '$lib/components/ui/transfer-list';
    import * as Tabs from "$lib/components/ui/tabs";
    import {Card, CardContent, CardHeader, CardTitle} from "$lib/components/ui/card";
    import {m} from '$lib/paraglide/messages.js';
    import type {Doc} from "$lib/entities/doc";
    import type {UserGroupDTO} from "$lib/api/usergroupAPI/response/GetAllUserGroupsResponse";
    import {Button} from "$lib/components/ui/button";
    import {toast} from "svelte-sonner";
    import CheckIcon from "@lucide/svelte/icons/check";
    import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
    import {tick} from "svelte";
    import * as Command from "$lib/components/ui/command";
    import * as Popover from "$lib/components/ui/popover";
    import {cn} from "$lib/utils";
    import {Label} from "$lib/components/ui/label";
    import {Checkbox} from "$lib/components/ui/checkbox";
    import {DocumentAPI} from "$lib/api/DocumentAPI";

    let {data} = $props()

    let selectedGroup = $state<{ id: string, name: string }>()
    let open = $state(false);
    let value = $state("");
    let triggerRef = $state<HTMLButtonElement>(null!);
    const selectedValue = $derived(data.groups.find((g) => g.id === value)?.name);
    let initialDenialGroupSource = $state(data.documents);

    let all = $state(false);

    function closeAndFocusTrigger() {
        open = false;
        tick().then(() => {
            triggerRef.focus();
        });
    }

    let accessDocumentsCore = new TransferList.Core<Doc>({
        initialSource: data.documents.filter(doc => !data.documentIds.includes(doc.id)),
        initialTarget: data.documents.filter(doc => data.documentIds.includes(doc.id)),
        filterPredicate: (doc, search) => doc.title.toLowerCase().includes(search.toLowerCase()),
    })

    let denialDocumentsCore = new TransferList.Core<Doc>({
        initialSource: initialDenialGroupSource,
        filterPredicate: (doc, search) => doc.title.toLowerCase().includes(search.toLowerCase()),
    })

    let accessGroupsCore = new TransferList.Core<UserGroupDTO>({
        initialSource: data.groups,
        filterPredicate: (group, search) => group.name.toLowerCase().includes(search.toLowerCase()),
    })

    async function giveAccess() {
        let noError = await new DocumentAPI().assignDocumentsToGroups(data.token, accessDocumentsCore.target.map(doc => doc.id), accessGroupsCore.target.map(group => group.id), all )
        if(noError) {
            toast.success(m.access_success())
        } else {
            toast.error(m.message_error())
        }
    }

    async function removeAccess() {
        let noError = await new DocumentAPI().unassignDocumentsToGroups(data.token, denialDocumentsCore.target.map(doc => doc.id), selectedGroup?.id ?? "", all )
        if(noError) {
            toast.success(m.denial_success())
        } else {
            toast.error(m.message_error())
        }
    }


</script>

<div class="container mx-auto py-8 space-y-6">
    <Tabs.Root value="grant">
        <Tabs.List class="w-full">
            <Tabs.Trigger value="grant">{m.give_access()}</Tabs.Trigger>
            <Tabs.Trigger value="rewoke">{m.remove_access()}</Tabs.Trigger>
        </Tabs.List>
        <Card>
            <CardHeader>
                <CardTitle class="text-2xl">{m.action_manage_access()}</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs.Content value="grant">
                    <TransferList.Root direction={'horizontal'}>
                        <TransferList.Container>
                            <TransferList.Title title={m.source_documents()}/>
                            <TransferList.Toolbar core={accessDocumentsCore} inputPlaceholder={m.placeholder_search()}
                                                  variant="source"/>
                            <TransferList.Body>
                                {#each accessDocumentsCore.filteredSource as row (row)}
                                    <TransferList.Item side={'source'} {row} core={accessDocumentsCore}>
                                        {row.title}
                                    </TransferList.Item>
                                {/each}
                            </TransferList.Body>
                        </TransferList.Container>
                        <TransferList.Container>
                            <TransferList.Title title={m.target_documents()}/>
                            <TransferList.Toolbar core={accessDocumentsCore} inputPlaceholder={m.placeholder_search()}
                                                  variant="target"/>
                            <TransferList.Body>
                                {#each accessDocumentsCore.filteredTarget as row (row)}
                                    <TransferList.Item side={'target'} {row} core={accessDocumentsCore}>
                                        {row.title}
                                    </TransferList.Item>
                                {/each}
                            </TransferList.Body>
                        </TransferList.Container>
                    </TransferList.Root>
                    <TransferList.Root class="mt-6" direction={'horizontal'}>
                        <TransferList.Container>
                            <TransferList.Title title={m.source_groups()}/>
                            <TransferList.Toolbar core={accessGroupsCore} inputPlaceholder={m.placeholder_search()}
                                                  variant="source"/>
                            <TransferList.Body>
                                {#each accessGroupsCore.filteredSource as row (row)}
                                    <TransferList.Item side={'source'} {row} core={accessGroupsCore}>
                                        {row.name}
                                    </TransferList.Item>
                                {/each}
                            </TransferList.Body>
                        </TransferList.Container>
                        <TransferList.Container>
                            <TransferList.Title title={m.target_groups()}/>
                            <TransferList.Toolbar core={accessGroupsCore} inputPlaceholder={m.placeholder_search()}
                                                  variant="target"/>
                            <TransferList.Body>
                                {#each accessGroupsCore.filteredTarget as row (row)}
                                    <TransferList.Item side={'target'} {row} core={accessGroupsCore}>
                                        {row.name}
                                    </TransferList.Item>
                                {/each}
                            </TransferList.Body>
                        </TransferList.Container>
                    </TransferList.Root>
                    <div class="mt-3 flex items-center justify-center gap-2">
                        <Checkbox bind:checked={all} id="all"/>
                        <Label for="all">{m.all()}</Label>
                    </div>

                    <Button class="mt-6 w-full" onclick={giveAccess}>{m.give_access()}</Button>

                </Tabs.Content>
                <Tabs.Content value="rewoke">

                    <div class="flex items-center gap-4">
                        <Popover.Root bind:open>
                            <Popover.Trigger bind:ref={triggerRef}>
                                {#snippet child({props})}
                                    <Button
                                            {...props}
                                            variant="outline"
                                            class="w-[calc(50%-8px)] justify-between"
                                            role="combobox"
                                            aria-expanded={open}
                                    >
                                        {selectedValue || m.select_group()}
                                        <ChevronsUpDownIcon class="opacity-50"/>
                                    </Button>
                                {/snippet}
                            </Popover.Trigger>
                            <Popover.Content class="w-full p-0">
                                <Command.Root>
                                    <Command.Input placeholder={m.placeholder_search()}/>
                                    <Command.List>
                                        <Command.Empty>{m.message_no_results()}</Command.Empty>
                                        <Command.Group value="groups">
                                            {#each data.groups as group (group.id)}
                                                <Command.Item
                                                        value={group.name}
                                                        onSelect={() => {
                                                        value = group.id;
                                                        selectedGroup = group;
                                                        closeAndFocusTrigger();
                                                      }}
                                                >
                                                    <CheckIcon
                                                            class={cn(value !== group.id && "text-transparent")}
                                                    />
                                                    {group.name}
                                                </Command.Item>
                                            {/each}
                                        </Command.Group>
                                    </Command.List>
                                </Command.Root>
                            </Popover.Content>
                        </Popover.Root>
                        <div class="flex items-center gap-2">
                            <Checkbox bind:checked={all} id="all"/>
                            <Label for="all">{m.all()}</Label>
                        </div>
                    </div>

                    <TransferList.Root class="mt-6" direction={'horizontal'}>
                        <TransferList.Container>
                            <TransferList.Title title={m.source_documents()}/>
                            <TransferList.Toolbar core={denialDocumentsCore} inputPlaceholder={m.placeholder_search()}
                                                  variant="source"/>
                            <TransferList.Body>
                                {#each denialDocumentsCore.filteredSource as row (row)}
                                    <TransferList.Item side={'source'} {row} core={denialDocumentsCore}>
                                        {row.title}
                                    </TransferList.Item>
                                {/each}
                            </TransferList.Body>
                        </TransferList.Container>
                        <TransferList.Container>
                            <TransferList.Title title={m.target_documents()}/>
                            <TransferList.Toolbar core={denialDocumentsCore} inputPlaceholder={m.placeholder_search()}
                                                  variant="target"/>
                            <TransferList.Body>
                                {#each denialDocumentsCore.filteredTarget as row (row)}
                                    <TransferList.Item side={'target'} {row} core={denialDocumentsCore}>
                                        {row.title}
                                    </TransferList.Item>
                                {/each}
                            </TransferList.Body>
                        </TransferList.Container>
                    </TransferList.Root>
                    <Button class="mt-6 w-full" onclick={removeAccess}>{m.remove_access()}</Button>
                </Tabs.Content>
            </CardContent>
        </Card>
    </Tabs.Root>

</div>