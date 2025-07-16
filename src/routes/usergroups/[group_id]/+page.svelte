<script lang="ts">
    import { Users, Crown, UserPlus, UserMinus, LogOut, ArrowLeft, Mail, Calendar, MoreVertical, Search, Trash2, Settings } from "lucide-svelte";
    import { m } from "$lib/paraglide/messages";
    import type { PageProps } from './$types';
    import { onMount } from 'svelte';
    import { toast } from "svelte-sonner";
    import { goto } from "$app/navigation";
    import * as Card from "$lib/components/ui/card";
    import * as Form from "$lib/components/ui/form";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { Avatar, AvatarImage, AvatarFallback } from "$lib/components/ui/avatar";
    import { Separator } from "$lib/components/ui/separator";
    import { superForm } from "sveltekit-superforms";
    import { zod4Client } from "sveltekit-superforms/adapters";
    import { addMemberSchema } from "./schema";

    // Typen für Gruppenmitglieder
    interface GroupMember {
        id: string;
        name: string;
        email: string;
        isAdmin: boolean;
        joinedAt: string;
        avatar?: string;
        isCurrentUser: boolean;
    }

    interface GroupDetails {
        id: string;
        name: string;
        description?: string;
        createdAt: string;
        createdBy: string;
        memberCount: number;
        members: GroupMember[];
    }

    let { data }: PageProps = $props();
    let isAddMemberDialogOpen = $state(false);
    let isLeaveGroupDialogOpen = $state(false);
    let memberToRemove: GroupMember | null = $state(null);
    let searchQuery = $state('');

    // Fallback falls data nicht die erwartete Struktur hat
    $effect(() => {
        if (!data) {
            data = { 
                form: null, 
                success: false, 
                error: false,
                group: null
            };
        }
    });

    // Beispieldaten für eine Gruppe - normalerweise aus data.group
    let groupDetails: GroupDetails = $state({
        id: "1",
        name: "Entwickler Team",
        description: "Hauptentwicklungsgruppe für das RAG-System",
        createdAt: "2024-01-15",
        createdBy: "Max Mustermann",
        memberCount: 8,
        members: [
            {
                id: "user1",
                name: "Max Mustermann",
                email: "max@example.com",
                isAdmin: true,
                joinedAt: "2024-01-15",
                isCurrentUser: true
            },
            {
                id: "user2", 
                name: "Anna Schmidt",
                email: "anna@example.com",
                isAdmin: true,
                joinedAt: "2024-01-16",
                isCurrentUser: false
            },
            {
                id: "user3",
                name: "Tom Weber",
                email: "tom@example.com",
                isAdmin: false,
                joinedAt: "2024-01-20",
                isCurrentUser: false
            },
            {
                id: "user4",
                name: "Lisa König",
                email: "lisa@example.com",
                isAdmin: false,
                joinedAt: "2024-01-22",
                isCurrentUser: false
            },
            {
                id: "user5",
                name: "Stefan Müller",
                email: "stefan@example.com",
                isAdmin: false,
                joinedAt: "2024-02-01",
                isCurrentUser: false
            }
        ]
    });

    // Aktueller Nutzer
    const currentUser = $derived(groupDetails.members.find(m => m.isCurrentUser));
    const isCurrentUserAdmin = $derived(currentUser?.isAdmin ?? false);

    // Gefilterte Mitglieder basierend auf Suchbegriff
    const filteredMembers = $derived(groupDetails.members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    ));

    const formDefaults = {
        email: ''
    };

    const form = superForm(data.form || formDefaults, {
        validators: zod4Client(addMemberSchema),
        onUpdated: ({ form }) => {
            if (form.valid) {
                // Neues Mitglied zur Liste hinzufügen
                const newMember: GroupMember = {
                    id: Date.now().toString(),
                    name: form.data.email.split('@')[0],
                    email: form.data.email,
                    isAdmin: false,
                    joinedAt: new Date().toISOString().split('T')[0],
                    isCurrentUser: false
                };
                groupDetails.members = [...groupDetails.members, newMember];
                groupDetails.memberCount++;
                isAddMemberDialogOpen = false;
                toast.success(`${newMember.name} wurde zur Gruppe hinzugefügt`);
            }
        }
    });

    const { form: formData, enhance } = form;

    onMount(() => {
        if (data.success) {
            toast.success("Gruppe erfolgreich geladen");
        } else if (data.error) {
            toast.error("Fehler beim Laden der Gruppe");
        }
    });

    function handleLeaveGroup() {
        if (currentUser) {
            groupDetails.members = groupDetails.members.filter(m => m.id !== currentUser.id);
            groupDetails.memberCount--;
            toast.success("Sie haben die Gruppe verlassen");
            goto('/groups');
        }
    }

    function handleRemoveMember(member: GroupMember) {
        if (member.id === currentUser?.id) {
            toast.error("Sie können sich nicht selbst entfernen");
            return;
        }
        
        groupDetails.members = groupDetails.members.filter(m => m.id !== member.id);
        groupDetails.memberCount--;
        memberToRemove = null;
        toast.success(`${member.name} wurde aus der Gruppe entfernt`);
    }

    function handleMakeAdmin(member: GroupMember) {
        const memberIndex = groupDetails.members.findIndex(m => m.id === member.id);
        if (memberIndex !== -1) {
            groupDetails.members[memberIndex].isAdmin = true;
            toast.success(`${member.name} ist jetzt Administrator`);
        }
    }

    function handleRemoveAdmin(member: GroupMember) {
        if (member.id === currentUser?.id) {
            toast.error("Sie können sich nicht selbst die Admin-Rechte entziehen");
            return;
        }
        
        const memberIndex = groupDetails.members.findIndex(m => m.id === member.id);
        if (memberIndex !== -1) {
            groupDetails.members[memberIndex].isAdmin = false;
            toast.success(`${member.name} ist kein Administrator mehr`);
        }
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('de-DE');
    }

    function getInitials(name: string) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
</script>

<div class="bg-muted/30 min-h-svh p-6">
    <div class="mx-auto max-w-6xl">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="sm" onclick={() => goto('/groups')} class="gap-2">
                    <ArrowLeft class="size-4" />
                    Zurück zu Gruppen
                </Button>
            </div>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-xl">
                        <Users class="size-8" />
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold">{groupDetails.name}</h1>
                        {#if groupDetails.description}
                            <p class="text-muted-foreground text-lg">{groupDetails.description}</p>
                        {/if}
                        <div class="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{groupDetails.memberCount} Mitglieder</span>
                            <Separator orientation="vertical" class="h-4" />
                            <span>Erstellt am {formatDate(groupDetails.createdAt)}</span>
                            <Separator orientation="vertical" class="h-4" />
                            <span>von {groupDetails.createdBy}</span>
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center gap-2">
                    {#if isCurrentUserAdmin}
                        <Button onclick={() => isAddMemberDialogOpen = true} class="gap-2">
                            <UserPlus class="size-4" />
                            Mitglied hinzufügen
                        </Button>
                    {/if}
                    
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <div class="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent">
                                <MoreVertical class="size-4" />
                            </div>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end">
                            {#if isCurrentUserAdmin}
                                <DropdownMenu.Item class="gap-2">
                                    <Settings class="size-4" />
                                    Gruppe bearbeiten
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator />
                            {/if}
                            <DropdownMenu.Item 
                                class="gap-2 text-destructive focus:text-destructive"
                                onclick={() => isLeaveGroupDialogOpen = true}
                            >
                                <LogOut class="size-4" />
                                Gruppe verlassen
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </div>
            </div>
        </div>

        <!-- Mitglieder Liste -->
        <Card.Root>
            <Card.Header>
                <div class="flex items-center justify-between">
                    <div>
                        <Card.Title>Mitglieder</Card.Title>
                        <Card.Description>Alle {groupDetails.memberCount} Mitglieder der Gruppe</Card.Description>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="relative">
                            <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Mitglieder suchen..." 
                                bind:value={searchQuery}
                                class="pl-9 w-64"
                            />
                        </div>
                    </div>
                </div>
            </Card.Header>
            <Card.Content class="p-0">
                <div class="divide-y">
                    {#each filteredMembers as member}
                        <div class="p-6">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-4">
                                    <Avatar class="size-12">
                                        <AvatarImage src={member.avatar} alt={member.name} />
                                        <AvatarFallback class="bg-primary/10 text-primary">
                                            {getInitials(member.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <h3 class="font-semibold">{member.name}</h3>
                                            {#if member.isAdmin}
                                                <Badge variant="secondary" class="gap-1">
                                                    <Crown class="size-3" />
                                                    Admin
                                                </Badge>
                                            {/if}
                                            {#if member.isCurrentUser}
                                                <Badge variant="outline">Sie</Badge>
                                            {/if}
                                        </div>
                                        <div class="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail class="size-3" />
                                            {member.email}
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <Calendar class="size-3" />
                                            Beigetreten am {formatDate(member.joinedAt)}
                                        </div>
                                    </div>
                                </div>
                                
                                {#if isCurrentUserAdmin && !member.isCurrentUser}
                                    <DropdownMenu.Root>
                                        <DropdownMenu.Trigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical class="size-4" />
                                            </Button>
                                    </DropdownMenu.Trigger>
                                        <DropdownMenu.Content align="end">
                                            {#if member.isAdmin}
                                                <DropdownMenu.Item 
                                                    class="gap-2"
                                                    onclick={() => handleRemoveAdmin(member)}
                                                >
                                                    <UserMinus class="size-4" />
                                                    Admin-Rechte entziehen
                                                </DropdownMenu.Item>
                                            {:else}
                                                <DropdownMenu.Item 
                                                    class="gap-2"
                                                    onclick={() => handleMakeAdmin(member)}
                                                >
                                                    <Crown class="size-4" />
                                                    Zum Admin machen
                                                </DropdownMenu.Item>
                                            {/if}
                                            <DropdownMenu.Separator />
                                            <DropdownMenu.Item 
                                                class="gap-2 text-destructive focus:text-destructive"
                                                onclick={() => memberToRemove = member}
                                            >
                                                <Trash2 class="size-4" />
                                                Aus Gruppe entfernen
                                            </DropdownMenu.Item>
                                        </DropdownMenu.Content>
                                    </DropdownMenu.Root>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </Card.Content>
        </Card.Root>

        <!-- Mitglied hinzufügen Dialog -->
        <Dialog.Root bind:open={isAddMemberDialogOpen}>
            <Dialog.Content class="sm:max-w-md">
                <Dialog.Header>
                    <Dialog.Title>Mitglied hinzufügen</Dialog.Title>
                    <Dialog.Description>
                        Fügen Sie ein neues Mitglied zur Gruppe "{groupDetails.name}" hinzu.
                    </Dialog.Description>
                </Dialog.Header>
                
                <form method="POST" action="?/addMember" use:enhance>
                    <div class="grid gap-4 py-4">
                        <Form.Field {form} name="email" let:attrs>
                            <Form.Label>E-Mail-Adresse</Form.Label>
                            <Form.Control>
                                <Input
                                    {...attrs}
                                    bind:value={$formData.email}
                                    placeholder="nutzer@example.com"
                                    type="email"
                                />
                            </Form.Control>
                            <Form.FieldErrors />
                        </Form.Field>
                    </div>
                    
                    <Dialog.Footer>
                        <Button type="button" variant="outline" onclick={() => isAddMemberDialogOpen = false}>
                            Abbrechen
                        </Button>
                        <Button type="submit" class="gap-2">
                            <UserPlus class="size-4" />
                            Mitglied hinzufügen
                        </Button>
                    </Dialog.Footer>
                </form>
            </Dialog.Content>
        </Dialog.Root>

        <!-- Gruppe verlassen Dialog -->
        <AlertDialog.Root bind:open={isLeaveGroupDialogOpen}>
            <AlertDialog.Content>
                <AlertDialog.Header>
                    <AlertDialog.Title>Gruppe verlassen</AlertDialog.Title>
                    <AlertDialog.Description>
                        Sind Sie sicher, dass Sie die Gruppe "{groupDetails.name}" verlassen möchten? 
                        Diese Aktion kann nicht rückgängig gemacht werden.
                    </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                    <AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
                    <AlertDialog.Action onclick={handleLeaveGroup} class="bg-destructive hover:bg-destructive/90">
                        Gruppe verlassen
                    </AlertDialog.Action>
                </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog.Root>

        <!-- Mitglied entfernen Dialog -->
        <AlertDialog.Root open={memberToRemove !== null} onOpenChange={(open) => !open && (memberToRemove = null)}>
            <AlertDialog.Content>
                <AlertDialog.Header>
                    <AlertDialog.Title>Mitglied entfernen</AlertDialog.Title>
                    <AlertDialog.Description>
                        Sind Sie sicher, dass Sie {memberToRemove?.name} aus der Gruppe "{groupDetails.name}" entfernen möchten? 
                        Diese Aktion kann nicht rückgängig gemacht werden.
                    </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                    <AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
                    <AlertDialog.Action 
                        onclick={() => memberToRemove && handleRemoveMember(memberToRemove)} 
                        class="bg-destructive hover:bg-destructive/90"
                    >
                        Mitglied entfernen
                    </AlertDialog.Action>
                </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog.Root>
    </div>
</div>