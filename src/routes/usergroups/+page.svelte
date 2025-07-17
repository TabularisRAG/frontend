<script lang="ts">
    import Users from "@lucide/svelte/icons/users";
    import Plus from "@lucide/svelte/icons/plus";
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
    import { goto } from "$app/navigation";
    import { zod4Client } from "sveltekit-superforms/adapters";

    let {data}: PageProps = $props();
    let isCreateDialogOpen = $state(false);
    let userGroups = $state(data.usergroups);

    console.log(data)


    const form = superForm(data.form, {
        validators: zod4Client(createGroupSchema)
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
        goto(`/usergroups/${group.id}`);
        toast.info(`Navigiere zu Gruppe: ${group.name}`);
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('de-DE');
    }
</script>

<div class="bg-muted/30 min-h-svh p-6">
    <div class="mx-auto max-w-6xl">
        <!-- Header -->
        <div class="mb-8">
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
        <div class="mb-8 grid gap-4 md:grid-cols-3">
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
                    <Card.Title class="text-sm font-medium">{m.all_groups()}</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">{userGroups.reduce((sum, group) => sum + group.user_count, 0)}</div>
                    <p class="text-muted-foreground text-xs">{m.over_all_groups()}</p>
                </Card.Content>
            </Card.Root>
        </div>

        <!-- Gruppen Liste -->
        <Card.Root>
            <Card.Header>
                <Card.Title>{m.my_groups()}</Card.Title>
                <Card.Description>{m.all_groups_youre_assigned_to()}</Card.Description>
            </Card.Header>
            <Card.Content class="p-0">
                <div class="divide-y">
                    {#each userGroups as group, index}
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
        
                <form method="POST" use:enhance>
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
                            <Plus class="size-4" />
                            {$submitting ? m.is_creating(): m.create_group()}
                        </Button>
                    </Dialog.Footer>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    </div>
</div>