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
    import { addMemberSchema, type AddMemberSchema } from "./schema";
    import type { User } from "$lib/entities/user";
    import * as Select from "$lib/components/ui/select";

    let { data }: PageProps = $props();

    let isAddMemberDialogOpen = $state(false);
    let isLeaveGroupDialogOpen = $state(false);

    let memberToRemove: User | null = $state(null);
    let searchQuery = $state('');

    const form = superForm(data.add_member_form, {
        validators: zod4Client(addMemberSchema)
    })
    const {form: formData, enhance} = form

    function getFullName(user : User) {
        return user.first_name + " " + user.last_name
    }

    let groupDetails = data.group
    let current_user = data.current_user
    console.log(data)

    let is_leader = checkCurrentUserIsLeader()

    // Aktueller Nutzer
    const isCurrentUserAdmin = $derived(current_user?.isAdmin ?? false);

    // Gefilterte Mitglieder basierend auf Suchbegriff
    const filteredMembers = $derived(groupDetails.users.filter(member =>
        getFullName(member).toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    ));


    onMount(() => {
        if (data.success) {
            toast.success("Gruppe erfolgreich geladen");
        } else {
            toast.error("Fehler beim Laden der Gruppe");
        }
    });



    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('de-DE');
    }

    function getInitials(name: string) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    function checkCurrentUserIsLeader() {
       return groupDetails.users.find(elem => elem.id == current_user!!.id)!!.is_leader
    }


    function leaveGroup() {
        
    }


    function removeMember(): any {
        throw new Error("Function not implemented.");
    }

    function changeRole(leader : boolean) {

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
                        <div class="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{groupDetails.user_count} Mitglieder</span>
                            <Separator orientation="vertical" class="h-4" />
                            <span>Erstellt am {formatDate(groupDetails.created_at)}</span>
                            <Separator orientation="vertical" class="h-4" />
                            <span>von {"Test name erstellt"}</span>
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center gap-2">
                    {#if isCurrentUserAdmin || is_leader}
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
                            {#if isCurrentUserAdmin || is_leader}
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
                        <Card.Description>Alle {groupDetails.user_count} Mitglieder der Gruppe</Card.Description>
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
                                        <AvatarImage alt={getFullName(member)} />
                                        <AvatarFallback class="bg-primary/10 text-primary">
                                           { getInitials(member.first_name + " " + member.last_name) }
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <h3 class="font-semibold">{getFullName(member)}</h3>
                                            {#if member.isAdmin}
                                                <Badge variant="secondary" class="gap-1">
                                                    <Crown class="size-3" />
                                                    Admin
                                                </Badge>
                                            {/if}
                                            {#if member.id == current_user.id}
                                                <Badge variant="outline">Sie</Badge>
                                            {/if}
                                        </div>
                                        <div class="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail class="size-3" />
                                            {member.email}
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <Calendar class="size-3" />
                                            Beigetreten am { formatDate(member.joined_at) }
                                        </div>
                                    </div>
                                </div>
                                
                                {#if isCurrentUserAdmin || is_leader}
                                    <DropdownMenu.Root>
                                        <DropdownMenu.Trigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical class="size-4" />
                                            </Button>
                                    </DropdownMenu.Trigger>
                                        <DropdownMenu.Content align="end">
                                            {#if is_leader}
                                                <DropdownMenu.Item 
                                                    class="gap-2"
                                                    onclick={() => {}}
                                                >
                                                    <UserMinus class="size-4" />
                                                    Admin-Rechte entziehen
                                                </DropdownMenu.Item>
                                            {:else}
                                                <DropdownMenu.Item 
                                                    class="gap-2"
                                                    onclick={() => {}}
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
                
                <form method="POST" class="w-2/3 space-y-6" use:enhance>
                    <Form.Field {form} name="email">
                      <Form.Control>
                        {#snippet children({ props })}
                          <Form.Label>Email</Form.Label>
                          <Select.Root
                            type="single"
                            bind:value={$formData.email}
                            name={props.name}
                          >
                            <Select.Trigger {...props}>
                              {$formData.email
                                ? $formData.email
                                : "Select a verified email to display"}
                            </Select.Trigger>
                            <Select.Content>
                                {#each data.allUsers as user}
                                <Select.Item value={user} label={user.first_name + " " + user.last_name} />
                              {/each}
                            </Select.Content>
                          </Select.Root>
                        {/snippet}
                      </Form.Control>
                      
                      <Form.FieldErrors />
                    </Form.Field>
                    <Form.Button>Submit</Form.Button>
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
                    <AlertDialog.Action onclick={() => {leaveGroup()}} class="bg-destructive hover:bg-destructive/90">
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
                        Sind Sie sicher, dass Sie {getFullName(memberToRemove!!)} aus der Gruppe "{groupDetails.name}" entfernen möchten? 
                        Diese Aktion kann nicht rückgängig gemacht werden.
                    </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                    <AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
                    <AlertDialog.Action 
                        onclick={() => removeMember()}
                        class="bg-destructive hover:bg-destructive/90"
                    >
                        Mitglied entfernen
                    </AlertDialog.Action>
                </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog.Root>
    </div>
</div>