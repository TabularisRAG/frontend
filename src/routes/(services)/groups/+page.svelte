<script lang="ts">
    import Search from "@lucide/svelte/icons/search";
    import Users from "@lucide/svelte/icons/users";
    import Plus from "@lucide/svelte/icons/plus";
    import LogOut from "@lucide/svelte/icons/log-out";
    import {m} from "$lib/paraglide/messages";
    import type { PageProps } from './$types';
    import { onMount } from 'svelte';
    import { toast } from "svelte-sonner";

    import * as Card from "$lib/components/ui/card";
    import * as Form from "$lib/components/ui/form";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator";

    import { superForm } from "sveltekit-superforms";
    import { createGroupSchema } from "./schema";

    import { UserGroup } from "$lib/entities/groups";
    import { goto, invalidateAll } from "$app/navigation";
    import { zod4Client } from "sveltekit-superforms/adapters";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import type { ActionResult } from "@sveltejs/kit";
    import {  deserialize } from "$app/forms";
    import type { UserGroupDTO } from "$lib/api/usergroupAPI/response/GetAllUserGroupsResponse";

    let {data}: PageProps = $props();

    let isCreateDialogOpen = $state(false);
    let groupToLeave : UserGroupDTO | null = $state(null);

    let isLeavingGroup = $state(false);
    
    let searchQuery = $state('');

    const filteredUserGroups = $derived(data.usergroups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));

    const form = superForm(data.form, {
        validators: zod4Client(createGroupSchema),
        onResult: async ({ result }) => {
            if (result.type === 'success') {
                isCreateDialogOpen = false;                
                toast.success(m.group_created_successfully());
                
                await invalidateAll();
                
            } else if (result.type === 'failure') {
                toast.error(m.error_while_creating_group());
            }
        },
        onError: () => {
            toast.error(m.error_while_creating_group());
        }
    });

    const {form: formData, enhance, submitting} = form

    
    onMount(() => {
        if (!data.success) {
            toast.error(m.error_while_loading_groups());
        }
    });

    function handleGroupClick(group: UserGroupDTO) {
        goto("./groups/" + group.id)
    }

    function handleClickLeaveGroup(group: UserGroupDTO, event : Event) {
        event.stopPropagation()
        groupToLeave = group
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString();
    }

    async function handleLeaveGroup(event: SubmitEvent) {
        event.preventDefault()

        const formData = new FormData(event.target as HTMLFormElement);
        
        isLeavingGroup = true;
        
        try {
            const response = await fetch('?/leaveOrDeleteGroup', {
                method: 'POST',
                body: formData
            });
            
            const result: ActionResult = deserialize(await response.text());
            
            if (result.type === 'success') {
                toast.success(m.group_left_or_deleted_successfully());
                groupToLeave = null;
                await invalidateAll();
            } else {
                toast.error(m.error_while_leaving_or_deleting_group());
            }
        } catch (error) {
            toast.error(m.error_while_leaving_or_deleting_group());
        } finally {
            isLeavingGroup = false;
        }
    }

    function should_display_delete(group : UserGroupDTO) {
        const isAdminAndNotInGroup = data.currentUser.is_admin && !group.current_user_is_in_group
        const isLastMemberInGroup = group.user_count == 1 && group.current_user_is_in_group
        const isLastLeaderAndOthersAreOnlyMembers = group.current_user_is_leader && group.leader_count == 1


        return isAdminAndNotInGroup || isLastMemberInGroup || isLastLeaderAndOthersAreOnlyMembers
    }
</script>

<div class="sticky top-[54px] overflow-hidden max-h-[calc(100vh-54px)] h-screen p-3 sm:p-6">
    <div class="mx-auto max-w-6xl h-full flex flex-col">
        <!-- Header -->
        <div class="mb-4 sm:mb-8 flex-shrink-0">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="flex items-center gap-3">
                    <div class="bg-primary text-primary-foreground flex size-8 sm:size-10 items-center justify-center rounded-lg">
                        <Users class="size-4 sm:size-5" />
                    </div>
                    <div>
                        <h1 class="text-xl sm:text-2xl font-bold">{m.usergroups()}</h1>
                        <p class="text-muted-foreground text-xs sm:text-sm">{m.manage_your_memberships()}</p>
                    </div>
                </div>
                <Button onclick={() => isCreateDialogOpen = true} class="gap-2 cursor-pointer text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2 w-full sm:w-auto">
                    <Plus class="size-4" />
                    <span class="hidden xs:inline">{m.create_new_group()}</span>
                    <span class="xs:hidden">{m.create_group()}</span>
                </Button>
            </div>
        </div>

        <!-- Statistics -->
        <div class="mb-8 hidden md:grid md:grid-cols-3 gap-4 flex-shrink-0">
            <Card.Root>
                <Card.Header class="pb-3">
                    <Card.Title class="text-sm font-medium">{m.all_groups()}</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">{data.usergroups.length}</div>
                    <p class="text-muted-foreground text-xs">{m.active_memberships()}</p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="pb-3">
                    <Card.Title class="text-sm font-medium">{m.leader_permissions()}</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">{data.usergroups.filter(g => g.current_user_is_leader).length}</div>
                    <p class="text-muted-foreground text-xs">{m.groups_with_leader_permission()}</p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="pb-3">
                    <Card.Title class="text-sm font-medium">{m.all_documents()}</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">{data.number_of_docs}</div>
                    <p class="text-muted-foreground text-xs">{m.over_all_groups()}</p>
                </Card.Content>
            </Card.Root>
        </div>

        <!-- Group List -->
        <Card.Root class="flex-1 flex flex-col min-h-0">
            <Card.Header class="flex-shrink-0">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div>
                        <Card.Title class="text-lg sm:text-xl">{m.my_groups()}</Card.Title>
                        <Card.Description class="text-xs sm:text-sm">{m.all_groups_youre_assigned_to()}</Card.Description>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="relative flex-1 sm:flex-none">
                            <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder={m.search_group()} 
                                bind:value={searchQuery}
                                class="pl-9 w-full sm:w-48 md:w-64"
                            />
                        </div>
                    </div>
                </div>
            </Card.Header>
            <Card.Content class="p-0 flex-1 overflow-hidden">
                <div class="divide-y h-full overflow-y-auto">
                    {#each filteredUserGroups as group, index}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <div
                            class="hover:bg-muted/50 cursor-pointer p-3 sm:p-6 transition-colors"
                            onclick={() => handleGroupClick(group)}
                            role="button"
                            tabindex="0"
                        >
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                                <div class="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                    <div class="bg-primary/10 text-primary flex size-10 sm:size-12 items-center justify-center rounded-lg flex-shrink-0">
                                        <Users class="size-5 sm:size-6" />
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <div class="flex items-center gap-2">
                                            <h3 class="font-semibold text-sm sm:text-base truncate">{group.name}</h3>
                                        </div>
                                        <div class="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                                            <span class="truncate">{group.user_count + " " + m.memberships()}</span>
                                            <Separator orientation="vertical" class="h-3 hidden sm:block" />
                                            <span class="truncate">{m.created_at() + " " + formatDate(group.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2 flex-shrink-0">
                                    <Button 
                                        onclick={(event) => handleClickLeaveGroup(group, event)} 
                                        class="cursor-pointer text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 w-full sm:w-auto {should_display_delete(group) ? 'bg-destructive hover:bg-destructive/90' : ''}"
                                        size="sm"
                                    >
                                        <LogOut class="size-3 sm:size-4" />
                                        { (() => should_display_delete(group) ? m.delete_group() : m.leave_group())()}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </Card.Content>
        </Card.Root>

        <!-- New group dialog -->
        <Dialog.Root bind:open={isCreateDialogOpen}>
            <Dialog.Content class="sm:max-w-md">
                <Dialog.Header>
                    <Dialog.Title>{m.create_new_group()}</Dialog.Title>
                    <Dialog.Description>
                        {m.create_new_user_group_you_will_be_added_as_leader()}
                    </Dialog.Description>
                </Dialog.Header>
        
                <form method="POST" action="?/createGroup" use:enhance>
                    <div class="grid gap-4 py-4">
                        <Form.Field {form} name="name">
                            <Form.Control>
                                {#snippet children({props})}
                                    <Form.Label>{m.group_name()}</Form.Label>
                                        <Input
                                            {...props}
                                            bind:value={$formData.name}
                                            placeholder={m.example_group_name_developer_team()}
                                        />
                                {/snippet}
                            </Form.Control>
                            <Form.FieldErrors />
                        </Form.Field>
                    </div>
                
                    <Dialog.Footer>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onclick={() => isCreateDialogOpen = false}
                            disabled={$submitting}
                            class="cursor-pointer disabled:cursor-not-allowed"
                        >
                            {m.abort()}
                        </Button>
                        <Button 
                            type="submit" 
                            class="gap-2 cursor-pointer disabled:cursor-not-allowed"
                            disabled={$submitting}
                        >
                            {#if $submitting}
                                <div class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                {m.is_creating()}
                            {:else}
                                <Plus class="size-4" />
                                {m.create_group()}
                            {/if}
                        </Button>
                    </Dialog.Footer>
                </form>
            </Dialog.Content>
        </Dialog.Root>

        <!-- Leave group dialog-->
        <AlertDialog.Root open={groupToLeave !== null} onOpenChange={(open) => !open && (groupToLeave = null)}>
            <AlertDialog.Content>
                <AlertDialog.Header>
                    <AlertDialog.Title> { (() => groupToLeave != null && should_display_delete(groupToLeave) ? m.delete_group() : m.leave_group())()}</AlertDialog.Title>
                    <AlertDialog.Description>
                        { (() => groupToLeave != null && should_display_delete(groupToLeave) ? m.are_you_sure_you_want_to_delete_the_group() : m.are_you_sure_you_want_to_leave_the_group())()}
                    </AlertDialog.Description>
                </AlertDialog.Header>
        
                <form method="POST" action="?/leaveOrDeleteGroup" onsubmit={handleLeaveGroup}>
                    <input type="hidden" name="groupId" value={groupToLeave?.id} />
        
                    <AlertDialog.Footer>
                        <AlertDialog.Cancel 
                            type="button" 
                            disabled={isLeavingGroup}
                            class="cursor-pointer disabled:cursor-not-allowed"
                        >
                            {m.abort()}
                        </AlertDialog.Cancel>
                        <Button 
                            type="submit"
                            class="bg-destructive hover:bg-destructive/90 cursor-pointer disabled:cursor-not-allowed"
                            disabled={isLeavingGroup}
                        >
                            {#if isLeavingGroup}
                                <div class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                { (() => groupToLeave != null && should_display_delete(groupToLeave) ? m.deleting_group() : m.leaving_group())()}
                            {:else}
                                <LogOut class="size-4" />
                                { (() => groupToLeave != null && should_display_delete(groupToLeave) ? m.delete_group() : m.leave_group())()}
                            {/if}
                        </Button>
                    </AlertDialog.Footer>
                </form>
            </AlertDialog.Content>
        </AlertDialog.Root>
        
    </div>
</div>