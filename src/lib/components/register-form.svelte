<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { cn } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { goto } from '$app/navigation';
	import { accessToken } from '../stores/auth';
	import AuthenticationAPI from "../../api/authenticationAPI/AuthenticationAPI";
  	import type { User } from "../../entities/user";
  	import type { ActionData } from "../../routes/demo/lucia/$types";
  import { m } from "$lib/paraglide/messages";

  let { class: className, form, ...restProps }: HTMLAttributes<HTMLDivElement> & { form: ActionData } = $props();

    let firstName = ""
    let lastName = ""
    let email = ""
    let password = ""
    let confirmPassword = ""

    const authApi = new AuthenticationAPI()
	
    async function handleRegister() {

      console.log("Start Register")
        const user: User = {
          email,
          firstName,
          lastName,
          password
        };

        await authApi.registerUser(user)

        console.log("Register");
        goto("/login")
      }

  </script>
  
  <div class={cn("flex flex-col gap-6", className)} {...restProps}>
    <Card.Root>
      <Card.Header class="text-center">
        <Card.Title class="text-xl">{m.create_account()}</Card.Title>
        <Card.Description>{m.enter_details_below()}</Card.Description>
      </Card.Header>
      <Card.Content>
        <form onsubmit={handleRegister}>
          <div class="grid gap-6">
            <div class="grid gap-3">
              <Label for="firstName">{m.first_name()}</Label>
              <Input id="firstName" type="text" bind:value={firstName} required />
            </div>
            <div class="grid gap-3">
              <Label for="lastName">{m.last_name()}</Label>
              <Input id="lastName" type="text" bind:value={lastName} required />
            </div>
            <div class="grid gap-3">
              <Label for="email">{m.email()}</Label>
              <Input id="email" type="email" bind:value={email} required />
            </div>
            <div class="grid gap-3">
              <Label for="password">{m.password()}</Label>
              <Input id="password" type="password" bind:value={password} required />
            </div>
            <div class="grid gap-3">
              <Label for="confirmPassword">{m.confirm_password()}</Label>
              <Input id="confirmPassword" type="password" bind:value={confirmPassword} required />
            </div>
            <Button type="submit" class="w-full">{m.register()}</Button>
          </div>
        </form>
      </Card.Content>
    </Card.Root>
    <div class="text-center text-sm">
      {m.already_have_account()}
      <a href="/login" class="underline underline-offset-4">{m.login()}</a>
    </div>
  </div>
  