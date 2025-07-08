<script lang="ts">
    import { m } from "$lib/paraglide/messages.js";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Separator } from "$lib/components/ui/separator";
    import { Badge } from "$lib/components/ui/badge";
    import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
    import * as Tabs from "$lib/components/ui/tabs";
    import { toast } from "svelte-sonner";
    import UserIcon from "@lucide/svelte/icons/user";
    import Mail from "@lucide/svelte/icons/mail";
    import Calendar from "@lucide/svelte/icons/calendar";
    import Shield from "@lucide/svelte/icons/shield";
    import Edit from "@lucide/svelte/icons/edit";
    import Save from "@lucide/svelte/icons/save";
    import X from "@lucide/svelte/icons/x";
    import Key from "@lucide/svelte/icons/key";
    import Activity from "@lucide/svelte/icons/activity";
    import FileText from "@lucide/svelte/icons/file-text";
    import MessageSquare from "@lucide/svelte/icons/message-square";
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    
    // User data from layout - updated structure
    const user = data.user;
    
    // Additional profile data that might come from a specific profile API
    let profileData = $state({
        documentsCount: data.documentsCount || 0,
        chatCount: data.chatCount || 0
    });

    let isEditing = $state(false);
    let editForm = $state({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || ''
    });

    let passwordForm = $state({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    function startEditing() {
        if (!user) return;
        isEditing = true;
        editForm.first_name = user.first_name;
        editForm.last_name = user.last_name;
        editForm.email = user.email;
    }

    function cancelEditing() {
        if (!user) return;
        isEditing = false;
        editForm = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
        };
    }

    async function saveProfile() {
        if (!user) return;
        // Hier würde die API-Anfrage zum Speichern stehen
        try {
            // await updateProfile(editForm);
            // user.first_name = editForm.first_name; // User wird über das Layout verwaltet
            // user.last_name = editForm.last_name;
            // user.email = editForm.email;
            isEditing = false;
            toast.success(m.profile_updated_successfully());
        } catch (error) {
            toast.error(m.profile_update_error());
        }
    }

    async function changePassword() {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error(m.passwords_dont_match());
            return;
        }
        
        try {
            // await updatePassword(passwordForm);
            passwordForm = {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
            toast.success(m.password_changed_successfully());
        } catch (error) {
            toast.error(m.password_change_error());
        }
    }

    function getInitials(firstName: string, lastName: string) {
        return (firstName[0] + lastName[0]).toUpperCase();
    }

    function getFullName(firstName: string, lastName: string) {
        return `${firstName} ${lastName}`;
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
</script>

<svelte:head>
    <title>{m.profile()} - TabulaRAG</title>
</svelte:head>

<main class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="flex items-center gap-4 mb-8">
        <h1 class="text-3xl font-bold">{m.profile()}</h1>
        {#if !isEditing}
            <Button variant="outline" size="sm" onclick={startEditing}>
                <Edit class="w-4 h-4 mr-2" />
                {m.edit()}
            </Button>
        {/if}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card class="lg:col-span-3">
            <CardHeader>
                {#if !user}
                    <div class="text-center py-8">
                        <p class="text-muted-foreground">{m.please_login_to_view_profile()}</p>
                        <Button href="/login" class="mt-4">{m.login()}</Button>
                    </div>
                {:else}
                    <div class="flex items-center gap-6">
                        <Avatar class="w-20 h-20">
                            <AvatarImage src={user.avatar} alt={getFullName(user.first_name, user.last_name)} />
                            <AvatarFallback class="text-xl">{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                        </Avatar>
                        <div class="flex-1">
                            {#if isEditing}
                                <div class="space-y-4">
                                    <div class="flex gap-4">
                                        <div class="flex-1">
                                            <Label for="first_name">{m.first_name()}</Label>
                                            <Input id="first_name" bind:value={editForm.first_name} />
                                        </div>
                                        <div class="flex-1">
                                            <Label for="last_name">{m.last_name()}</Label>
                                            <Input id="last_name" bind:value={editForm.last_name} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label for="email">{m.email()}</Label>
                                        <Input id="email" type="email" bind:value={editForm.email} />
                                    </div>
                                    <div class="flex gap-2">
                                        <Button onclick={saveProfile} size="sm">
                                            <Save class="w-4 h-4 mr-2" />
                                            {m.save()}
                                        </Button>
                                        <Button variant="outline" onclick={cancelEditing} size="sm">
                                            <X class="w-4 h-4 mr-2" />
                                            {m.cancel()}
                                        </Button>
                                    </div>
                                </div>
                            {:else}
                                <div class="space-y-2">
                                    <div class="flex items-center gap-2">
                                        <h2 class="text-2xl font-semibold">{getFullName(user.first_name, user.last_name)}</h2>
                                        {#if user.is_admin}
                                            <Badge variant="destructive">
                                                <Shield class="w-3 h-3 mr-1" />
                                                {m.admin()}
                                            </Badge>
                                        {:else}
                                            <Badge variant="secondary">
                                                <UserIcon class="w-3 h-3 mr-1" />
                                                {m.user()}
                                            </Badge>
                                        {/if}
                                    </div>
                                    <div class="flex items-center gap-2 text-muted-foreground">
                                        <Mail class="w-4 h-4" />
                                        {user.email}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/if}
            </CardHeader>
        </Card>

        {#if user}
            <Card>
                <CardHeader class="pb-3">
                    <CardTitle class="text-base flex items-center gap-2">
                        <FileText class="w-4 h-4" />
                        {m.documents()}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{profileData.documentsCount}</div>
                    <p class="text-xs text-muted-foreground">{m.uploaded()}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="pb-3">
                    <CardTitle class="text-base flex items-center gap-2">
                        <MessageSquare class="w-4 h-4" />
                        {m.chats()}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{profileData.chatCount}</div>
                    <p class="text-xs text-muted-foreground">{m.conversations_held()}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="pb-3">
                    <CardTitle class="text-base flex items-center gap-2">
                        <Activity class="w-4 h-4" />
                        {m.activity()}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-xs text-muted-foreground">{m.user_id()}</div>
                    <div class="text-sm font-medium">{user.id}</div>
                </CardContent>
            </Card>
        {/if}

        {#if user}
            <div class="lg:col-span-3">
                <Tabs.Root value="account" class="w-full">
                    <Tabs.List class="grid w-full grid-cols-3">
                        <Tabs.Trigger value="account">{m.account()}</Tabs.Trigger>
                        <Tabs.Trigger value="security">{m.security()}</Tabs.Trigger>
                        <Tabs.Trigger value="preferences">{m.preferences()}</Tabs.Trigger>
                    </Tabs.List>
                    
                    <Tabs.Content value="account" class="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{m.account_information()}</CardTitle>
                                <CardDescription>{m.account_details()}</CardDescription>
                            </CardHeader>
                            <CardContent class="space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label class="text-sm font-medium">{m.user_id()}</Label>
                                        <p class="text-sm text-muted-foreground">{user.id}</p>
                                    </div>
                                    <div>
                                        <Label class="text-sm font-medium">{m.role()}</Label>
                                        <p class="text-sm text-muted-foreground">{user.is_admin ? m.administrator() : m.user()}</p>
                                    </div>
                                    <div>
                                        <Label class="text-sm font-medium">{m.first_name()}</Label>
                                        <p class="text-sm text-muted-foreground">{user.first_name}</p>
                                    </div>
                                    <div>
                                        <Label class="text-sm font-medium">{m.last_name()}</Label>
                                        <p class="text-sm text-muted-foreground">{user.last_name}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Tabs.Content>
                    
                    <Tabs.Content value="security" class="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{m.change_password()}</CardTitle>
                                <CardDescription>{m.update_password_for_security()}</CardDescription>
                            </CardHeader>
                            <CardContent class="space-y-4">
                                <div class="space-y-2">
                                    <Label for="current-password">{m.current_password()}</Label>
                                    <Input 
                                        id="current-password" 
                                        type="password" 
                                        bind:value={passwordForm.currentPassword}
                                    />
                                </div>
                                <div class="space-y-2">
                                    <Label for="new-password">{m.new_password()}</Label>
                                    <Input 
                                        id="new-password" 
                                        type="password" 
                                        bind:value={passwordForm.newPassword}
                                    />
                                </div>
                                <div class="space-y-2">
                                    <Label for="confirm-password">{m.confirm_new_password()}</Label>
                                    <Input 
                                        id="confirm-password" 
                                        type="password" 
                                        bind:value={passwordForm.confirmPassword}
                                    />
                                </div>
                                <Button onclick={changePassword} class="w-full">
                                    <Key class="w-4 h-4 mr-2" />
                                    {m.change_password()}
                                </Button>
                            </CardContent>
                        </Card>
                    </Tabs.Content>
                    
                    <Tabs.Content value="preferences" class="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{m.user_preferences()}</CardTitle>
                                <CardDescription>{m.personalize_experience()}</CardDescription>
                            </CardHeader>
                            <CardContent class="space-y-4">
                                <div class="text-sm text-muted-foreground">
                                    {m.language_theme_settings_in_navbar()}
                                </div>
                                <Separator />
                                <div>
                                    <Label class="text-sm font-medium">{m.notifications()}</Label>
                                    <div class="space-y-2 mt-2">
                                        <div class="flex items-center justify-between">
                                            <span class="text-sm">{m.email_notifications()}</span>
                                            <input type="checkbox" class="rounded" checked />
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-sm">{m.chat_notifications()}</span>
                                            <input type="checkbox" class="rounded" checked />
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-sm">{m.document_updates()}</span>
                                            <input type="checkbox" class="rounded" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Tabs.Content>
                </Tabs.Root>
            </div>
        {/if}
    </div>
</main>