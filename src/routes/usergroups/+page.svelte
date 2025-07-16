<script lang="ts">
    //import { Users, Plus, Crown, ChevronRight, Settings } from "lucide-svelte";
    import Users from "@lucide/svelte/icons/users"
    import Plus from "@lucide/svelte/icons/circle-plus"
    import Crown from "@lucide/svelte/icons/circle-plus"
    import ChevronRight from "@lucide/svelte/icons/circle-plus"
    import Settings from "@lucide/svelte/icons/circle-plus"
    import { m } from "$lib/paraglide/messages";
    import type { PageProps } from './$types';
    import { onMount } from 'svelte';
    import { toast } from "svelte-sonner";
    import * as Card from "$lib/components/ui/card";
    import * as Form from "$lib/components/ui/form";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import { superForm } from "sveltekit-superforms";
    import { zod4Client } from "sveltekit-superforms/adapters";
    import { createGroupSchema } from "./schema";
    import type { UserGroup } from "$lib/entities/groups";


    let { data }: PageProps = $props();
    let isCreateDialogOpen = $state(false);
    let selectedGroup: UserGroup | null = $state(null);

    // Beispieldaten - normalerweise aus data.groups
    let userGroups = $state(data.usergroups)
   
    onMount(() => {
        if (data.success) {
            toast.success("Gruppen erfolgreich geladen");
        } else {
            toast.error("Fehler beim Laden der Gruppen");
        }
    });

    // Fallback-Objekt falls data.form nicht existiert
    const formDefaults = {
        name: '',
        description: ''
    };

    const form = superForm(data.form || formDefaults, {
        validators: zod4Client(createGroupSchema),
        onUpdated: ({ form }) => {
            if (form.valid) {
                // Neue Gruppe zur Liste hinzufügen
                const newGroup: UserGroup = {
                    id: Date.now().toString(),
                    name: form.data.name,
                    description: form.data.description || '',
                    memberCount: 1,
                    isAdmin: true,
                    createdAt: new Date().toISOString().split('T')[0]
                };
                userGroups = [...userGroups, newGroup];
                isCreateDialogOpen = false;
                toast.success(`Gruppe "${newGroup.name}" erfolgreich erstellt`);
            }
        }
    });

    const { form: formData, enhance: formEnhance } = form;

    function handleGroupClick(group: UserGroup) {
        selectedGroup = group;
        // Hier würde normalerweise eine Navigation erfolgen
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
                        <h1 class="text-2xl font-bold">Nutzergruppen</h1>
                        <p class="text-muted-foreground text-sm">Verwalten Sie Ihre Gruppenmitgliedschaften</p>
                    </div>
                </div>
                <Button onclick={() => isCreateDialogOpen = true} class="gap-2">
                    <Plus class="size-4" />
                    Neue Gruppe erstellen
                </Button>
            </div>
        </div>

        <!-- Statistiken -->
        <div class="mb-8 grid gap-4 md:grid-cols-3">
            <Card.Root>
                <Card.Header class="pb-3">
                    <Card.Title class="text-sm font-medium">Gesamt Gruppen</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">{userGroups.length}</div>
                    <p class="text-muted-foreground text-xs">Aktive Mitgliedschaften</p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="pb-3">
                    <Card.Title class="text-sm font-medium">Leader Rechte</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">{userGroups.filter(g => g.current_user_is_leader).length}</div>
                    <p class="text-muted-foreground text-xs">Gruppen mit Admin-Rechten</p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="pb-3">
                    <Card.Title class="text-sm font-medium">Gesamt Mitglieder</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">{userGroups.reduce((sum, group) => sum + group.user_count, 0)}</div>
                    <p class="text-muted-foreground text-xs">Über alle Gruppen</p>
                </Card.Content>
            </Card.Root>
        </div>

        <!-- Gruppen Liste -->
        <Card.Root>
            <Card.Header>
                <Card.Title>Meine Gruppen</Card.Title>
                <Card.Description>Alle Gruppen, denen Sie angehören</Card.Description>
            </Card.Header>
            <Card.Content class="p-0">
                <div class="divide-y">
                    {#each userGroups as group, index}
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
                                            <span>{group.user_count} Mitglieder</span>
                                            <Separator orientation="vertical" class="h-3" />
                                            <span>Erstellt am {formatDate(group.created_at)}</span>
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
                    <Dialog.Title>Neue Gruppe erstellen</Dialog.Title>
                    <Dialog.Description>
                        Erstellen Sie eine neue Nutzergruppe. Sie werden automatisch als Administrator hinzugefügt.
                    </Dialog.Description>
                </Dialog.Header>
                
                <form method="POST" use:enhance={formEnhance}>
                    <div class="grid gap-4 py-4">
                        <Form.Field {form} name="name">
                            <Form.Control>
                                {#snippet children({props})}
                                    <Form.Label>Gruppenname</Form.Label>
                                    <Input
                                        {...props}
                                        bind:value={$formData.name}
                                        placeholder="z.B. Entwickler Team"
                                    />
                                {/snippet}
                            </Form.Control>
                            <Form.FieldErrors />
                        </Form.Field>

                    </div>
                    
                    <Dialog.Footer>
                        <Button type="button" variant="outline" onclick={() => isCreateDialogOpen = false}>
                            Abbrechen
                        </Button>
                        <Button type="submit" class="gap-2">
                            <Plus class="size-4" />
                            Gruppe erstellen
                        </Button>
                    </Dialog.Footer>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    </div>
</div>