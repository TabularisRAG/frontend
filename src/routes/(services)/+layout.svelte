<script lang="ts">
  import { m } from "$lib/paraglide/messages.js";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { setLocale } from "$lib/paraglide/runtime";
  import Globe from "@lucide/svelte/icons/globe";
  import SunMoon from "@lucide/svelte/icons/sun-moon";
  import Sun from "@lucide/svelte/icons/sun";
  import MonitorSmartphone from "@lucide/svelte/icons/monitor-smartphone";
  import Moon from "@lucide/svelte/icons/moon";
  import User from "@lucide/svelte/icons/user";
  import UserCog from "@lucide/svelte/icons/user-cog";
  import LogOut from "@lucide/svelte/icons/log-out";
  import Menu from "@lucide/svelte/icons/menu";
  import Files from "@lucide/svelte/icons/files";
  import MessageCircle from "@lucide/svelte/icons/message-circle";
  import CircleUser from "@lucide/svelte/icons/circle-user";
  import Users from "@lucide/svelte/icons/users";
  import Settings from "@lucide/svelte/icons/settings";
  import { languages } from "$lib/languages";
  import { resetMode, setMode } from "mode-watcher";
  import { goto } from "$app/navigation";
  import { userStore } from "$lib/stores/user";
  import { logout } from "$lib/stores/auth"

  let { children } = $props();

</script>

<div class="sticky top-0">
  <nav class="flex justify-between items-center mx-8 py-2 gap-8">
    <Button href="../" variant="link" class="text-2xl font-bold"
      >TabulaRAG</Button
    >
    <div class="hidden md:flex justify-center items-center gap-2">
      <Button href="/documents" variant="link">{m.documents()}</Button>
      <Button href="/chat" variant="link">{m.chat()}</Button>
      <!--admin only-->
      {#if $userStore?.isAdmin}
        <Button href="/users" variant="link">{m.users()}</Button>
        <Button href="/groups" variant="link">{m.groups()}</Button>
      {/if}
    </div>
    <div class="hidden md:flex justify-center items-center gap-2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="outline"
              class="h-9 w-9 lg:h-9 lg:px-4 lg:py-2 lg:w-fit"
            >
              <Globe />
              <span class="sr-only lg:not-sr-only">{m.language()}</span>
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            <DropdownMenu.GroupHeading>{m.language()}</DropdownMenu.GroupHeading
            >
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
              {#each languages as { code, name, flag }}
                <DropdownMenu.Item onSelect={() => setLocale(code)}>
                  <img class="h-5 mr-1" src={flag} alt={name} />
                  {name}
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Group>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="outline"
              class="h-9 w-9 lg:h-9 lg:px-4 lg:py-2 lg:w-fit"
            >
              <SunMoon />
              <span class="sr-only lg:not-sr-only">{m.theme()}</span>
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            <DropdownMenu.GroupHeading>{m.theme()}</DropdownMenu.GroupHeading>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
              <DropdownMenu.Item onSelect={() => setMode("dark")}>
                <Moon class="mr-1 text-foreground" />
                {m.dark()}
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setMode("light")}>
                <Sun class="mr-1 text-foreground" />
                {m.light()}
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => resetMode()}>
                <MonitorSmartphone class="mr-1 text-foreground" />
                {m.system()}
              </DropdownMenu.Item>
            </DropdownMenu.Group>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>


      {#if $userStore != null}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="outline"
              class="h-9 w-9 lg:h-9 lg:px-4 lg:py-2 lg:w-fit"
            >
              <UserCog />
              <span class="sr-only lg:not-sr-only">{m.profile()}</span>
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Group>
            {#if $userStore != null}
              <DropdownMenu.Item onSelect={() => goto("/profile")}>
                <User class="mr-1 text-foreground" />
                {m.profile()}
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => goto("/settings")}>
                <Settings class="mr-1 text-foreground" />
                {m.settigs()}
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => {
                logout()
                goto("/login")
              }}>
                <LogOut class="mr-1 text-foreground" />
                {m.logout()}
              </DropdownMenu.Item>
            {/if}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="outline"
            size="icon"
            class="flex md:hidden"
          >
            <Menu />
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Group>
          <DropdownMenu.Item onSelect={() => goto("/documents")}>
            <Files class="mr-1 text-foreground" />
            {m.documents()}
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => goto("/chat")}>
            <MessageCircle class="mr-1 text-foreground" />
            {m.chat()}
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => goto("/users")}>
            <CircleUser class="mr-1 text-foreground" />
            {m.users()}
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => goto("/groups")}>
            <Users class="mr-1 text-foreground" />
            {m.groups()}
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>
              <SunMoon class="mr-1 text-foreground" />{m.theme()}
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent sideOffset={8}>
              <DropdownMenu.Item onSelect={() => setMode("dark")}>
                <Moon
                  class="mr-1 text-foreground"
                />{m.dark()}</DropdownMenu.Item
              >
              <DropdownMenu.Item onSelect={() => setMode("light")}>
                <Sun
                  class="mr-1 text-foreground"
                />{m.light()}</DropdownMenu.Item
              >
              <DropdownMenu.Item onSelect={() => resetMode()}>
                <MonitorSmartphone
                  class="mr-1 text-foreground"
                />{m.system()}</DropdownMenu.Item
              >
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>
              <Globe class="mr-1 text-foreground" />{m.language()}
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent sideOffset={8}>
              {#each languages as { code, name, flag }}
                <DropdownMenu.Item onSelect={() => setLocale(code)}>
                  <img class="h-5 mr-1" src={flag} alt={name} />
                  {name}
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Group>

        <DropdownMenu.Separator />

        <DropdownMenu.Group>
          <DropdownMenu.Item onSelect={() => goto("/profile")}>
            <User class="mr-1 text-foreground" />
            {m.profile()}
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => goto("/settings")}>
            <Settings class="mr-1 text-foreground" />
            {m.settigs()}
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => {}}>
            <LogOut class="mr-1 text-foreground" />
            {logout()}
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
      
    </DropdownMenu.Root>
    {/if}
      
    {#if $userStore == null}
        <Button href="/login">{m.login_now()}</Button>
    {/if}
  </nav>
  <Separator />
</div>
{@render children()}
