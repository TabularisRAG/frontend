<script lang="ts">
    import { m } from "$lib/paraglide/messages.js";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Form from "$lib/components/ui/form";
    import {
      Card,
      CardContent,
      CardDescription,
      CardHeader,
      CardTitle,
    } from "$lib/components/ui/card";
    import AddModelDialog from "./AddModelDialog.svelte";
    import { Badge } from "$lib/components/ui/badge";
    import {
      Avatar,
      AvatarFallback,
    } from "$lib/components/ui/avatar";
    import * as Tabs from "$lib/components/ui/tabs";
    import { toast } from "svelte-sonner";
    import UserIcon from "@lucide/svelte/icons/user";
    import Mail from "@lucide/svelte/icons/mail";
    import Shield from "@lucide/svelte/icons/shield";
    import Key from "@lucide/svelte/icons/key";
    import Activity from "@lucide/svelte/icons/activity";
    import Settings from "@lucide/svelte/icons/settings";
    import Cpu from "@lucide/svelte/icons/cpu";
    import BarChart from "@lucide/svelte/icons/bar-chart";
    import Plus from "@lucide/svelte/icons/plus";
    import type { PageData } from "./$types";
    import type { ModelData } from "$lib/entities/modelData";
    import { superForm } from "sveltekit-superforms";
    import { zod4Client } from "sveltekit-superforms/adapters";
    import { changePasswordSchema } from "./schema";
    import type { UserResponse } from "$lib/entities/user";
  
    let { data }: { data: PageData } = $props();
  
    const user = data.user as unknown as UserResponse;
    const jwt = data.jwt || "";
  
    let adminSettings = $state(data.adminData);
    let total_tokens_for_all_models = $state(
      calculateAllTokens(adminSettings.availableModels)
    );
    let showAddModelDialog = $state(false);
  
    function handleModelAdded(models: ModelData[]) {
      adminSettings.availableModels = models;
      toast.success(m.model_add_success());
    }
  
    function openAddModelDialog() {
      showAddModelDialog = true;
    }
  
    function calculateAllTokens(models: ModelData[]): number {
      return models.reduce((sum, model) => sum + (model.total_tokens || 0), 0);
    }
  
    const availableProvidersForDialog = $derived(
      adminSettings.availableProviders.map((provider) => ({
        value: provider,
        label: provider,
      }))
    );
  
    const form = superForm(data.form, {
      validators: zod4Client(changePasswordSchema),
      applyAction: true,
      onResult: ({ result }) => {
        if (result.type === "failure") {
          const message = result.data?.message || m.error_occurred();
          toast.error(message);
        }
      }
    });
  
    const { form: formData, enhance } = form;
  
    function getInitials(first_name: string, last_name: string) {
      return (first_name[0] + last_name[0]).toUpperCase();
    }
  
    function getFullName(first_name: string, last_name: string) {
      return `${first_name} ${last_name}`;
    }
  
    function formatNumber(num: number) {
      return new Intl.NumberFormat("de-DE").format(num);
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
                    <h2 class="text-2xl font-semibold">
                      {getFullName(user.first_name, user.last_name)}
                    </h2>
                    {#if user.is_admin}
                      <Badge variant="destructive">
                        <Shield class="w-3 h-3 mr-1" />
                        {m.administrator()}
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
  
        <div class="lg:col-span-3">
          <Tabs.Root value="account" class="w-full">
            <Tabs.List class="grid w-full {user.is_admin ? 'grid-cols-3' : 'grid-cols-2'}">
              <Tabs.Trigger value="account">{m.account()}</Tabs.Trigger>
              <Tabs.Trigger value="security">{m.security()}</Tabs.Trigger>
              {#if user.is_admin}
                <Tabs.Trigger value="admin">
                  <Settings class="w-4 h-4 mr-2" />
                  {m.model_management()}
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
                      <Label>{m.user_id()}</Label>
                      <p class="text-sm text-muted-foreground">{user.id}</p>
                    </div>
                    <div>
                      <Label>{m.role()}</Label>
                      <p class="text-sm text-muted-foreground">
                        {user.is_admin ? m.administrator() : m.user()}
                      </p>
                    </div>
                    <div>
                      <Label>{m.first_name()}</Label>
                      <p class="text-sm text-muted-foreground">{user.first_name}</p>
                    </div>
                    <div>
                      <Label>{m.last_name()}</Label>
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
                  <form method="POST" use:enhance>
                    <div class="grid gap-3">
                      <Form.Field {form} name="oldpassword">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label>{m.current_password()}</Form.Label>
                            <Input {...props} bind:value={$formData.oldpassword} type="password" />
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors />
                      </Form.Field>
  
                      <Form.Field {form} name="newpassword">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label>{m.password()}</Form.Label>
                            <Input {...props} bind:value={$formData.newpassword} type="password" />
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors />
                      </Form.Field>
  
                      <Form.Field {form} name="confirmPassword">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label>{m.confirm_password()}</Form.Label>
                            <Input {...props} bind:value={$formData.confirmPassword} type="password" />
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors />
                      </Form.Field>
                    </div>
  
                    <Button class="w-full" type="submit">
                      <Key class="w-4 h-4 mr-2" />
                      {m.change_password()}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Tabs.Content>
  
            {#if user.is_admin}
              <Tabs.Content value="admin" class="space-y-4">
                <Card>
                  <CardHeader>
                    <div class="flex items-center justify-between">
                      <div>
                        <CardTitle class="flex items-center gap-2">
                          <Cpu class="w-5 h-5" />
                          {m.model_management()}
                        </CardTitle>
                        <CardDescription>{m.manage_available_models()}</CardDescription>
                      </div>
                      <Button onclick={openAddModelDialog} size="sm">
                        <Plus class="w-4 h-4 mr-2" />
                        {m.model_add_button()}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent class="space-y-4">
                    <div>
                      <Label class="text-sm font-medium mb-3 block">{m.available_models()}</Label>
                      {#if adminSettings.isLoading}
                        <div class="flex items-center justify-center p-8">
                          <div class="text-sm text-muted-foreground">{m.loading_models()}</div>
                        </div>
                      {:else if adminSettings.availableModels.length === 0}
                        <div class="text-center p-8 text-muted-foreground">
                          <p>{m.no_models_available()}</p>
                          <p class="text-xs mt-1">{m.add_model_hint()}</p>
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
  
                <Card>
                  <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                      <BarChart class="w-5 h-5" />
                      {m.llm_usage_statistics()}
                    </CardTitle>
                    <CardDescription>{m.usage_overview()}</CardDescription>
                  </CardHeader>
                  <CardContent class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="p-4 bg-blue-50 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">
                          {formatNumber(total_tokens_for_all_models)}
                        </div>
                        <div class="text-sm text-blue-600">{m.total_tokens()}</div>
                      </div>
                    </div>
  
                    <div>
                      <h4 class="font-medium mb-3">{m.usage_by_model()}</h4>
                      <div class="space-y-3">
                        {#each adminSettings.availableModels as model}
                          <div class="flex items-center justify-between p-3 border rounded-lg">
                            <div class="flex-1">
                              <div class="font-medium">{model.model_name}</div>
                              <div class="text-sm text-muted-foreground">
                                {formatNumber(model.total_tokens)} Tokens
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
    modelAdded={handleModelAdded}
    bind:showAddModelDialog
    availableProviders={availableProvidersForDialog}
    {jwt}
  />
  