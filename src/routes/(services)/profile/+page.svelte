<script lang="ts">
    import { m } from "$lib/paraglide/messages.js";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import AddModelDialog from './AddModelDialog.svelte';
    import { Separator } from "$lib/components/ui/separator";
    import { Badge } from "$lib/components/ui/badge";
    import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
    import * as Tabs from "$lib/components/ui/tabs";
    import * as Select from "$lib/components/ui/select";
    import * as Dialog from "$lib/components/ui/dialog";
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
    import Settings from "@lucide/svelte/icons/settings";
    import Cpu from "@lucide/svelte/icons/cpu";
    import BarChart from "@lucide/svelte/icons/bar-chart";
    import Zap from "@lucide/svelte/icons/zap";
    import Plus from "@lucide/svelte/icons/plus";
    import Trash2 from "@lucide/svelte/icons/trash-2";
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    
    // User data from layout - updated structure
    const user = data.user;
    const jwt = data.jwt;
    
    // Additional profile data that might come from a specific profile API
    let profileData = $state({
        documentsCount: data.documentsCount || 0,
        chatCount: data.chatCount || 0
    });

    // Admin LLM settings
    let adminSettings = $state({
        currentLLM: data.currentLLM || 'gpt-4',
        availableLLMs: data.availableLLMs || [
            { value: 'gpt-4', label: 'GPT-4', provider: 'OPENAI' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OPENAI' },
            { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', provider: 'ANTHROPIC' },
            { value: 'claude-3-haiku', label: 'Claude 3 Haiku', provider: 'ANTHROPIC' },
            { value: 'gemini-pro', label: 'Gemini Pro', provider: 'GOOGLE' }
        ]
    });

    // Model management

    // Entferne das doppelte Dialog-System und verwende nur:
    let showAddModelDialog = $state(false);
    
    // Event handler
    function handleModelAdded(event) {
        const createdModel = event.detail;
        
        // Aktualisiere die verfügbaren LLMs
        adminSettings.availableLLMs = [
            ...adminSettings.availableLLMs,
            {
                value: createdModel.model_name,
                label: createdModel.model_name, // oder createdModel.display_name falls verfügbar
                provider: createdModel.provider
            }
        ];
        
        toast.success('Modell erfolgreich hinzugefügt');
    }
    
    function openAddModelDialog() {
        showAddModelDialog = true;
    }

    const availableProviders = [
        { value: 'OPENAI', label: 'OpenAI' },
        { value: 'ANTHROPIC', label: 'Anthropic' },
        { value: 'GOOGLE', label: 'Google' }
    ];

    // LLM Usage Statistics
    let llmUsage = $state({
        totalTokens: data.totalTokens || 0,
        totalCost: data.totalCost || 0,
        monthlyUsage: data.monthlyUsage || [
            { month: 'Januar', tokens: 45000, cost: 12.50 },
            { month: 'Februar', tokens: 52000, cost: 14.30 },
            { month: 'März', tokens: 48000, cost: 13.20 },
            { month: 'April', tokens: 61000, cost: 16.80 },
            { month: 'Mai', tokens: 55000, cost: 15.10 },
            { month: 'Juni', tokens: 67000, cost: 18.40 }
        ],
        modelUsage: data.modelUsage || [
            { model: 'GPT-4', tokens: 150000, cost: 45.00, percentage: 55 },
            { model: 'GPT-3.5 Turbo', tokens: 200000, cost: 20.00, percentage: 30 },
            { model: 'Claude 3 Sonnet', tokens: 80000, cost: 24.00, percentage: 15 }
        ]
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
        // API call to save profile
        try {
            // await updateProfile(editForm);
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

    async function changeLLM(newLLM: string) {
        try {
            // await updateLLMSetting(newLLM);
            adminSettings.currentLLM = newLLM;
            toast.success(`LLM erfolgreich auf ${newLLM} geändert`);
        } catch (error) {
            toast.error('Fehler beim Ändern des LLM');
        }
    }

    async function deleteModel(modelValue: string) {
        if (!confirm('Sind Sie sicher, dass Sie dieses Modell löschen möchten?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/models/${modelValue}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Fehler beim Löschen des Modells');
            }

            // Remove from available LLMs list
            adminSettings.availableLLMs = adminSettings.availableLLMs.filter(
                llm => llm.value !== modelValue
            );

            // If deleted model was the current one, switch to first available
            if (adminSettings.currentLLM === modelValue && adminSettings.availableLLMs.length > 0) {
                adminSettings.currentLLM = adminSettings.availableLLMs[0].value;
            }

            toast.success('Modell erfolgreich gelöscht');
        } catch (error) {
            toast.error('Fehler beim Löschen des Modells');
            console.error('Error deleting model:', error);
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

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    function formatNumber(num: number) {
        return new Intl.NumberFormat('de-DE').format(num);
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
                    <Tabs.List class="grid w-full {user.is_admin ? 'grid-cols-4' : 'grid-cols-3'}">
                        <Tabs.Trigger value="account">{m.account()}</Tabs.Trigger>
                        <Tabs.Trigger value="security">{m.security()}</Tabs.Trigger>
                        <Tabs.Trigger value="preferences">{m.preferences()}</Tabs.Trigger>
                        {#if user.is_admin}
                            <Tabs.Trigger value="admin">
                                <Settings class="w-4 h-4 mr-2" />
                                Admin
                            </Tabs.Trigger>
                        {/if}
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

                    {#if user.is_admin}
                        <Tabs.Content value="admin" class="space-y-4">
                            <!-- Model Management -->
                            <Card>
                                <CardHeader>
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <CardTitle class="flex items-center gap-2">
                                                <Cpu class="w-5 h-5" />
                                                Model Management
                                            </CardTitle>
                                            <CardDescription>
                                                Verwalten Sie verfügbare LLM-Modelle im System
                                            </CardDescription>
                                        </div>
                                        <Button onclick={openAddModelDialog} size="sm">
                                            <Plus class="w-4 h-4 mr-2" />
                                            Modell hinzufügen
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent class="space-y-4">
                                    <div class="space-y-2">
                                        <Label for="llm-select">Aktuelles Standard-LLM</Label>
                                        <Select.Root bind:value={adminSettings.currentLLM}>
                                            <Select.Trigger class="w-full">
                                                <span class="text-sm">
                                                    {adminSettings.availableLLMs.find(llm => llm.value === adminSettings.currentLLM)?.label || 'LLM auswählen'}
                                                </span>
                                            </Select.Trigger>
                                            <Select.Content>
                                                {#each adminSettings.availableLLMs as llm}
                                                    <Select.Item 
                                                        value={llm.value} 
                                                        onclick={() => changeLLM(llm.value)}
                                                    >
                                                        {llm.label}
                                                    </Select.Item>
                                                {/each}
                                            </Select.Content>
                                        </Select.Root>
                                    </div>
                                    
                                    <div class="p-3 bg-muted rounded-md">
                                        <div class="flex items-center gap-2 text-sm">
                                            <Zap class="w-4 h-4" />
                                            <span class="font-medium">Aktuell aktiv:</span>
                                            <Badge variant="secondary">{adminSettings.currentLLM}</Badge>
                                        </div>
                                    </div>

                                    <!-- Available Models List -->
                                    <div>
                                        <Label class="text-sm font-medium mb-3 block">Verfügbare Modelle</Label>
                                        <div class="space-y-2 max-h-60 overflow-y-auto">
                                            {#each adminSettings.availableLLMs as llm}
                                                <div class="flex items-center justify-between p-3 border rounded-lg">
                                                    <div class="flex items-center gap-3">
                                                        <Badge variant="outline" class="text-xs">
                                                            {llm.provider}
                                                        </Badge>
                                                        <div>
                                                            <div class="font-medium text-sm">{llm.label}</div>
                                                            <div class="text-xs text-muted-foreground">{llm.value}</div>
                                                        </div>
                                                        {#if llm.value === adminSettings.currentLLM}
                                                            <Badge variant="secondary" class="text-xs">Standard</Badge>
                                                        {/if}
                                                    </div>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onclick={() => deleteModel(llm.value)}
                                                        class="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 class="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <!-- LLM Usage Statistics -->
                            <Card>
                                <CardHeader>
                                    <CardTitle class="flex items-center gap-2">
                                        <BarChart class="w-5 h-5" />
                                        LLM Usage Statistiken
                                    </CardTitle>
                                    <CardDescription>
                                        Übersicht über die Nutzung und Kosten verschiedener LLM-Modelle
                                    </CardDescription>
                                </CardHeader>
                                <CardContent class="space-y-6">
                                    <!-- Overall Stats -->
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div class="p-4 bg-blue-50 rounded-lg">
                                            <div class="text-2xl font-bold text-blue-600">
                                                {formatNumber(llmUsage.totalTokens)}
                                            </div>
                                            <div class="text-sm text-blue-600">Tokens gesamt</div>
                                        </div>
                                        <div class="p-4 bg-green-50 rounded-lg">
                                            <div class="text-2xl font-bold text-green-600">
                                                {formatCurrency(llmUsage.totalCost)}
                                            </div>
                                            <div class="text-sm text-green-600">Kosten gesamt</div>
                                        </div>
                                    </div>

                                    <!-- Model Usage Breakdown -->
                                    <div>
                                        <h4 class="font-medium mb-3">Nutzung nach Modell</h4>
                                        <div class="space-y-3">
                                            {#each llmUsage.modelUsage as model}
                                                <div class="flex items-center justify-between p-3 border rounded-lg">
                                                    <div class="flex-1">
                                                        <div class="font-medium">{model.model}</div>
                                                        <div class="text-sm text-muted-foreground">
                                                            {formatNumber(model.tokens)} Tokens
                                                        </div>
                                                    </div>
                                                    <div class="text-right">
                                                        <div class="font-medium">{formatCurrency(model.cost)}</div>
                                                        <div class="text-sm text-muted-foreground">
                                                            {model.percentage}% der Nutzung
                                                        </div>
                                                    </div>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>

                                    <!-- Monthly Usage -->
                                    <div>
                                        <h4 class="font-medium mb-3">Monatliche Nutzung</h4>
                                        <div class="space-y-2">
                                            {#each llmUsage.monthlyUsage as month}
                                                <div class="flex items-center justify-between p-2 rounded">
                                                    <span class="text-sm">{month.month}</span>
                                                    <div class="text-right">
                                                        <div class="text-sm font-medium">{formatCurrency(month.cost)}</div>
                                                        <div class="text-xs text-muted-foreground">
                                                            {formatNumber(month.tokens)} Tokens
                                                        </div>
                                                    </div>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Tabs.Content>
                    {/if}
                </Tabs.Root>
            </div>
        {/if}
    </div>
</main>

<AddModelDialog
    bind:showAddModelDialog
    {availableProviders}
    on:modelAdded={handleModelAdded}
    jwt=jwt
/>
