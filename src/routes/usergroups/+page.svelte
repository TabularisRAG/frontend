<script lang="ts">
    import Users from "@lucide/svelte/icons/users";
    import Plus from "@lucide/svelte/icons/plus";
    import Crown from "@lucide/svelte/icons/crown";
    import ChevronRight from "@lucide/svelte/icons/chevron-right";
    import Settings from "@lucide/svelte/icons/settings";

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
    import type { SuperValidated } from "sveltekit-superforms";
    import { createGroupSchema } from "./schema";
    import type { CreateGroupSchema } from "./schema";

    import { UserGroup } from "$lib/entities/groups";
    import UserGroupAPI from "$lib/api/usergroupAPI/usergroupAPI";
    import { goto } from "$app/navigation";
    import { invalidateAll } from "$app/navigation";

    let { data }: { data: { usergroups: UserGroup[], success: boolean, form: SuperValidated<CreateGroupSchema> } } = $props();
    let isCreateDialogOpen = $state(false);

    let userGroups = $state(data.usergroups);

    // Initialize superForm with the form data from the server
    const form = superForm(data.form, {
        resetForm: true,
        onUpdated: ({ form }) => {
            if (form.valid) {
                toast.success("Gruppe erfolgreich erstellt");
                isCreateDialogOpen = false;
                invalidateAll();
            }
        },
        onError: ({ result }) => {
            toast.error("Fehler beim Erstellen der Gruppe");
        }
    });

    const { form: formData, enhance: formEnhance, submitting } = form;

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
        
                <form method="POST" action="?/createGroup" use:formEnhance>
                    <div class="grid gap-4 py-4">
                        <Form.Field {form} name="name">
                            <Form.Control>
                                <Form.Label>Gruppenname</Form.Label>
                                <Input
                                    bind:value={$formData.name}
                                    placeholder="z.B. Entwickler Team"
                                />
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
                            Abbrechen
                        </Button>
                        <Button 
                            type="submit" 
                            class="gap-2"
                            disabled={$submitting}
                        >
                            <Plus class="size-4" />
                            {$submitting ? 'Wird erstellt...' : 'Gruppe erstellen'}
                        </Button>
                    </Dialog.Footer>
                </form>
            </Dialog.Content>
        </Dialog.Root>
        
    </div>
</div>