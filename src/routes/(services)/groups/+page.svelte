<script lang="ts">
    import {Search } from "lucide-svelte";

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
    import { goto, invalidate, invalidateAll } from "$app/navigation";
    import { zod4Client } from "sveltekit-superforms/adapters";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import type { ActionResult } from "@sveltejs/kit";
    import { applyAction, deserialize } from "$app/forms";

    let {data}: PageProps = $props();
    let isCreateDialogOpen = $state(false);
    let isLeaveGroupDialogOpen = $state(false);

    console.log(data)
    let userGroups = $state(data.usergroups);
    let groupToLeave : UserGroup | null = $state(null);
    let isLeavingGroup = $state(false);
    
    let searchQuery = $state('');

    const filteredUserGroups = $derived(userGroups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));

    const form = superForm(data.form, {
        validators: zod4Client(createGroupSchema),
        onResult: async ({ result }) => {
            if (result.type === 'success') {
                // Close dialog
                isCreateDialogOpen = false;
                
                // Show success toast
                toast.success("Gruppe erfolgreich erstellt!");
                
                // Invalidate and reload data
                await invalidateAll();
                
                // Update local state with fresh data
                userGroups = data.usergroups;
            } else if (result.type === 'failure') {
                // Show error toast
                toast.error("Fehler beim Erstellen der Gruppe");
            }
        },
        onError: () => {
            toast.error("Ein unerwarteter Fehler ist aufgetreten");
        }
    });

    const {form: formData, enhance, submitting} = form

    
    onMount(() => {
        if (data.success) {
            toast.success("Gruppen erfolgreich geladen");
        } else {
            toast.error("Fehler beim Laden der Gruppen");
        }
    });

    function handleGroupClick(group: UserGroup) {
        toast.info(`Navigiere zu Gruppe: ${group.name}`);
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('de-DE');
    }

    // Enhanced leave group handler with proper form submission
    async function handleLeaveGroup(event: SubmitEvent) {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        
        isLeavingGroup = true;
        
        try {
            const response = await fetch('?/leaveGroup', {
                method: 'POST',
                body: formData
            });
            
            const result: ActionResult = deserialize(await response.text());
            
            if (result.type === 'success') {
                toast.success("Gruppe erfolgreich verlassen!");
                groupToLeave = null;
                await invalidateAll();
                userGroups = data.usergroups;
            } else {
                toast.error("Fehler beim Verlassen der Gruppe");
            }
        } catch (error) {
            toast.error("Ein unerwarteter Fehler ist aufgetreten");
        } finally {
            isLeavingGroup = false;
        }
    }
</script>

<div class="sticky top-[54px] overflow-hidden max-h-[calc(100vh-54px)] h-screen p-6">
    <div class="mx-auto max-w-6xl h-full flex flex-col">
        <!-- Header -->
        <div class="mb-8 flex-shrink-0">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
                        <Users class="size-5" />
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold">{m.usergroups()}</h1>
                        <p class="text-muted-foreground text-sm">{m.manage_your_memberships()}</p>
                    </div>
                </div>
                <Button onclick={() => isCreateDialogOpen = true} class="gap-2">
                    <Plus class="size-4" />
                    {m.create_new_group()}
                </Button>
            </div>
        </div>

        <!-- Statistiken -->
        <div class="mb-8 grid gap-4 md:grid-cols-3 flex-shrink-0">
            <Card.Root>
                <Card.Header class="pb-3">
                    <Card.Title class="text-sm font-medium">{m.all_groups()}</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">{userGroups.length}</div>
                    <p class="text-muted-foreground text-xs">{m.active_memberships()}</p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="pb-3">
                    <Card.Title class="text-sm font-medium">{m.leader_permissions()}</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">{userGroups.filter(g => g.current_user_is_leader).length}</div>
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

        <!-- Gruppen Liste -->
        <Card.Root class="flex-1 flex flex-col min-h-0">
            <Card.Header class="flex-shrink-0">
                <div class="flex items-center justify-between">
                    <div>
                        <Card.Title>{m.my_groups()}</Card.Title>
                        <Card.Description>{m.all_groups_youre_assigned_to()}</Card.Description>
        
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="relative">
                            <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Gruppe suchen..." 
                                bind:value={searchQuery}
                                class="pl-9 w-64"
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
                            class="hover:bg-muted/50 cursor-pointer p-6 transition-colors"
                            onclick={() => handleGroupClick(group)}
                            role="button"
                            tabindex="0"
                        >
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-4">
                                    <div class="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-lg">
                                        <Users class="size-6" />
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <h3 class="font-semibold">{group.name}</h3>
                                        </div>
                                        <div class="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>{group.user_count + " " + m.memberships()}</span>
                                            <Separator orientation="vertical" class="h-3" />
                                            <span>{m.created_at() + " " + formatDate(group.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                        <Button onclick={() => {
                                            groupToLeave = userGroups.find((each) => each.id == group.id)!!
                                            isLeaveGroupDialogOpen = true;
                                        }}>
                                            <LogOut class="size-4" />
                                            {m.leave_group()}
                                        </Button>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </Card.Content>
        </Card.Root>

        <!-- Neue Gruppe Dialog -->
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
                        >
                            {m.abort()}
                        </Button>
                        <Button 
                            type="submit" 
                            class="gap-2"
                            disabled={$submitting}
                        >
                            {#if $submitting}
                                <!-- Loading spinner -->
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

        <!-- Gruppe verlassen Dialog -->
        <AlertDialog.Root open={groupToLeave !== null} onOpenChange={(open) => !open && (groupToLeave = null)}>
            <AlertDialog.Content>
                <AlertDialog.Header>
                    <AlertDialog.Title>{m.leave_group()}</AlertDialog.Title>
                    <AlertDialog.Description>
                        {m.are_you_sure_you_want_to_live_the_group()}
                    </AlertDialog.Description>
                </AlertDialog.Header>
        
                <form method="POST" action="?/leaveGroup" onsubmit={handleLeaveGroup}>
                    <input type="hidden" name="groupId" value={groupToLeave?.id} />
        
                    <AlertDialog.Footer>
                        <AlertDialog.Cancel type="button" disabled={isLeavingGroup}>
                            {m.abort()}
                        </AlertDialog.Cancel>
                        <Button 
                            type="submit"
                            class="bg-destructive hover:bg-destructive/90"
                            disabled={isLeavingGroup}
                        >
                            {#if isLeavingGroup}
                                <!-- Loading spinner -->
                                <div class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                Verlasse Gruppe...
                            {:else}
                                <LogOut class="size-4" />
                                {m.leave_group()}
                            {/if}
                        </Button>
                    </AlertDialog.Footer>
                </form>
            </AlertDialog.Content>
        </AlertDialog.Root>
        
    </div>
</div>