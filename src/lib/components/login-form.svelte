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

	let { class: className, form, ...restProps }: HTMLAttributes<HTMLDivElement> & { form: ActionData } = $props();
	
	let email = '';
	let password = '';
	let token: string | null = null;
	let error: string | null = null;

	
	const authApi = new AuthenticationAPI()
	
	async function handleLogin() {
    const user: User = {
      email,
      password
    };

    token = await authApi.login(user);

    if (token === "UNAUTHORIZED") {
      error = "Invalid email or password.";
    } else {
      error = null;
	  
	  accessToken.set(token)

      console.log("Login successful:", $accessToken);
      goto("/documents")
    }
  }


</script>


<div class={cn("flex flex-col gap-6", className)} {...restProps}>
	<Card.Root>
		<Card.Header class="text-center">
			<Card.Title class="text-xl">Welcome back</Card.Title>
			<Card.Description>Login with your account credentials</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleLogin}>
				<div class="grid gap-6">
					<div class="grid gap-6">
						<div class="grid gap-3">
							<Label for="email">Email</Label>
							<Input id="email" type="email" placeholder="m@example.com" bind:value={email} required />
						</div>
						<div class="grid gap-3">
							<div class="flex items-center">
								<Label for="password">Password</Label>
								<a
									href="##"
									class="ml-auto text-sm underline-offset-4 hover:underline"
								>
									Forgot your password?
								</a>
							</div>
							<Input id="password" type="password" bind:value={password} required />
						</div>
						<Button type="submit" class="w-full">Login</Button>
					</div>
					<div class="text-center text-sm">
						Don&apos;t have an account?
						<a href="##" class="underline underline-offset-4"> Sign up </a>
					</div>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
	<div
		class="text-muted-foreground *:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4 text-balance text-center text-xs"
	>
		By clicking continue, you agree to our <a href="##">Terms of Service</a>
		and <a href="##">Privacy Policy</a>.
	</div>
	{#if error}
	<p class="text-red-500 text-sm">{error}</p>
	{/if}
</div>
