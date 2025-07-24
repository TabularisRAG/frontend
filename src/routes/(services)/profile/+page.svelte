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
    import Users from "@lucide/svelte/icons/users";
    import UserCheck from "@lucide/svelte/icons/user-check";
    import type { PageData } from "./$types";
    import type { ModelData } from "$lib/entities/modelData";
    import { superForm } from "sveltekit-superforms";
    import { zod4Client } from "sveltekit-superforms/adapters";
    import { changePasswordSchema } from "./schema";
    import type { UserResponse } from "$lib/entities/user";
    import { enhance } from "$app/forms";
    import type { SubmitFunction } from "@sveltejs/kit";
  
    let { data }: { data: PageData } = $props();
  
    const user = data.user as unknown as UserResponse;
    const jwt = data.jwt || "";
  
    let adminSettings = $state(data.adminData);
    let inactive_users = $state(data.inactive_users);
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
        if (result.type === "success" && result.data?.success) {
          const message = result.data?.message || m.password_changed_successfully();
          toast.success(message);
        } else if (result.type === "failure") {
          const message = result.data?.message || m.message_error();
          toast.error(message);
        }
      }
    });
  
    const { form: formData, enhance: passwordEnhance } = form;
  
    function getInitials(first_name: string, last_name: string) {
      return (first_name[0] + last_name[0]).toUpperCase();
    }
  
    function getFullName(first_name: string, last_name: string) {
      return `${first_name} ${last_name}`;
    }
  
    function formatNumber(num: number) {
      return new Intl.NumberFormat("de-DE").format(num);
    }

    let activatingUser = $state(false);

    const activateUserAction: SubmitFunction = ({ formData }) => {
      activatingUser = true;
      const userId = formData.get('userId') as string;
      const userEmail = formData.get('userEmail') as string;
      
      return async ({ result }) => {
        activatingUser = false;
        
        if (result.type === 'success') {
          toast.success(m.user_activated_successfully({ email: userEmail }));
          
          inactive_users = inactive_users.filter(u => u.id !== userId);
        } else if (result.type === 'failure') {
          const message = result.data?.message || m.user_activation_error();
          toast.error(message);
        }
      };
    };

    async function activateUser(userId: string, userEmail: string) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '?/activateUser';
      
      const userIdInput = document.createElement('input');
      userIdInput.type = 'hidden';
      userIdInput.name = 'userId';
      userIdInput.value = userId;
      form.appendChild(userIdInput);

      const userEmailInput = document.createElement('input');
      userEmailInput.type = 'hidden';
      userEmailInput.name = 'userEmail';
      userEmailInput.value = userEmail;
      form.appendChild(userEmailInput);
      
      document.body.appendChild(form);
      
      enhance(form, activateUserAction);
      form.requestSubmit();
      
      document.body.removeChild(form);
    }
  </script>
  
  <svelte:head>
    <title>{m.nav_profile()} - TabulaRAG</title>
  </svelte:head>
  
  <main class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="flex items-center gap-4 mb-8">
      <h1 class="text-3xl font-bold">{m.nav_profile()}</h1>
    </div>
  
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card class="lg:col-span-3">
        <CardHeader>
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
        </CardHeader>
      </Card>
  
      {#if user}  
        <div class="lg:col-span-3">
          <Tabs.Root value="account" class="w-full">
            <Tabs.List class="grid w-full {user.is_admin ? 'grid-cols-4' : 'grid-cols-2'}">
              <Tabs.Trigger value="account">{m.account()}</Tabs.Trigger>
              <Tabs.Trigger value="security">{m.security()}</Tabs.Trigger>
              {#if user.is_admin}
                <Tabs.Trigger value="admin">
                  <Settings class="w-4 h-4 mr-2" />
                  {m.model_management()}
                </Tabs.Trigger>
                <Tabs.Trigger value="users">
                  <Users class="w-4 h-4 mr-2" />
                  {m.user()}
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
                      <Label>{m.field_first_name()}</Label>
                      <p class="text-sm text-muted-foreground">{user.first_name}</p>
                    </div>
                    <div>
                      <Label>{m.field_last_name()}</Label>
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
                  <form method="POST" action="?/changePassword" use:passwordEnhance>
                    <div class="grid gap-3">
                      <Form.Field {form} name="oldPassword">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label>{m.current_password()}</Form.Label>
                            <Input {...props} bind:value={$formData.oldPassword} type="password" />
                          {/snippet}
                        </Form.Control>
                        <Form.FieldErrors />
                      </Form.Field>
  
                      <Form.Field {form} name="newPassword">
                        <Form.Control>
                          {#snippet children({ props })}
                            <Form.Label>{m.field_password()}</Form.Label>
                            <Input {...props} bind:value={$formData.newPassword} type="password" />
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

              <Tabs.Content value="users" class="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                      <Users class="w-5 h-5" />
                      {m.inactive_users()}
                    </CardTitle>
                    <CardDescription>{m.manage_inactive_users_description()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {#if inactive_users && inactive_users.length > 0}
                      <div class="space-y-3">
                        {#each inactive_users as inactiveUser}
                          <div class="flex items-center justify-between p-4 border rounded-lg">
                            <div class="flex items-center gap-3">
                              <Avatar class="w-10 h-10">
                                <AvatarFallback class="text-sm">
                                  {getInitials(inactiveUser.first_name, inactiveUser.last_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div class="font-medium">
                                  {getFullName(inactiveUser.first_name, inactiveUser.last_name)}
                                </div>
                                <div class="text-sm text-muted-foreground">
                                  {inactiveUser.email}
                                </div>
                                <div class="text-xs text-muted-foreground">
                                  ID: {inactiveUser.id}
                                </div>
                              </div>
                            </div>
                            <div class="flex items-center gap-2">
                              <Badge variant="secondary">{m.inactive()}</Badge>
                              <Button 
                                type="button" 
                                size="sm" 
                                variant="outline"
                                onclick={() => activateUser(inactiveUser.id, inactiveUser.email)}
                                disabled={activatingUser}
                              >
                                <UserCheck class="w-4 h-4 mr-2" />
                                {activatingUser ? m.activating() : m.activate()}
                              </Button>
                            </div>
                          </div>
                        {/each}
                      </div>
                    {:else}
                      <div class="text-center py-8 text-muted-foreground">
                        <Users class="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{m.no_inactive_users()}</p>
                        <p class="text-sm mt-1">{m.all_users_activated()}</p>
                      </div>
                    {/if}
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