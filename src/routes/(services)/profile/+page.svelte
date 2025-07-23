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
    import Plus from "@lucide/svelte/icons/plus";
    import type { PageData } from './$types';
    import UserAPI from '$lib/api/userAPI/userAPI.js';
    import type { AdminData } from "$lib/entities/adminData";
    

    let { data }: { data: PageData } = $props();
    
    const user = data.user;
    const jwt = data.jwt || "";
    const userAPI = new UserAPI();

    let adminSettings =  $state(data.adminData)

    let showAddModelDialog = $state(false);
        
    function handleModelAdded(event) {
    
    adminSettings.availableModels = event.detail;
    
    toast.success('Modell erfolgreich hinzugefügt');
    }

    
    function openAddModelDialog() {
        showAddModelDialog = true;
    }

    // Convert providers array to the format expected by AddModelDialog
    const availableProvidersForDialog = $derived(
        adminSettings.availableProviders.map(provider => ({
            value: provider,
            label: provider
        }))
    );

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



    let passwordForm = $state({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    async function changePassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.error(m.passwords_dont_match());
    return;
  }

  try {
    await userAPI.changePassword(jwt, passwordForm.currentPassword, passwordForm.newPassword);

    passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    toast.success(m.password_changed_successfully());

} catch (error) {
  if (error instanceof Error) {
    switch (error.message) {
      case "ERR_INCORRECT_OLD_PASSWORD":
        toast.error(m.incorrect_current_password());
        break;
      case "ERR_DEFAULT_ADMIN_PASSWORD":
        toast.error(m.default_admin_password_change_not_allowed());
        break;
      default:
        toast.error(m.password_change_error());
    }
  } else {
    toast.error(m.password_change_error());
  }
}
    }


    function getInitials(first_name: string, last_name: string) {
        return (first_name[0] + last_name[0]).toUpperCase();
    }

    function getFullName(first_name: string, last_name: string) {
        return `${first_name} ${last_name}`;
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
                            <AvatarFallback class="text-xl">{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                        </Avatar>
                        <div class="flex-1">
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
                        </div>
                    </div>
                {/if}
            </CardHeader>
        </Card>

        {#if user}
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
                    <Tabs.List class="grid w-full {user.is_admin ? 'grid-cols-3' : 'grid-cols-2'}">
                        <Tabs.Trigger value="account">{m.account()}</Tabs.Trigger>
                        <Tabs.Trigger value="security">{m.security()}</Tabs.Trigger>
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
                                    <!-- Available Models List -->
                                    <div>
                                        <Label class="text-sm font-medium mb-3 block">Verfügbare Modelle</Label>
                                        {#if adminSettings.isLoading}
                                            <div class="flex items-center justify-center p-8">
                                                <div class="text-sm text-muted-foreground">Lade Modelle...</div>
                                            </div>
                                        {:else if adminSettings.availableModels.length === 0}
                                            <div class="text-center p-8 text-muted-foreground">
                                                <p>Keine Modelle verfügbar</p>
                                                <p class="text-xs mt-1">Fügen Sie ein neues Modell hinzu</p>
                                            </div>
                                        {:else}
                                            <div class="space-y-2 max-h-60 overflow-y-auto">
                                                {#each adminSettings.availableModels as model}
                                                    <div class="flex items-center justify-between p-3 border rounded-lg">
                                                        <div class="flex items-center gap-3">
                                                            <Badge variant="outline" class="text-xs">
                                                                {model.provider}
                                                            </Badge>
                                                            <div>
                                                                <div class="font-medium text-sm">{model.model_name}</div>
                                                                {#if model.apiKey}
                                                                    <div class="text-xs text-muted-foreground">
                                                                        API Key: ****{model.apiKey.slice(-4)}
                                                                    </div>
                                                                {/if}
                                                            </div>
                                                        </div>
                                                    </div>
                                                {/each}
                                            </div>
                                        {/if}
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
    availableProviders={availableProvidersForDialog}
    on:modelAdded={handleModelAdded}
    jwt={jwt}
/>