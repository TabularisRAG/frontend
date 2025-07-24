<script lang="ts">
    import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
    import {m} from "$lib/paraglide/messages";
    import type {PageProps} from './$types';
    import {onMount} from 'svelte';
    import {toast} from "svelte-sonner";
    import * as Card from "$lib/components/ui/card";
    import * as Form from "$lib/components/ui/form";
    import {Label} from "$lib/components/ui/label";
    import {Input} from "$lib/components/ui/input";
    import {Button} from "$lib/components/ui/button";
    import {superForm} from "sveltekit-superforms";
    import {zod4Client} from "sveltekit-superforms/adapters";
    import {loginSchema} from "./schema";

    let {data}: PageProps = $props();
    
    onMount(() => {
        if (data.logout && !data.error) {
            toast.success(m.auth_logout_success())
        } else if (data.error) {
            toast.error(m.message_error())
        }
    })

    const form = superForm(data.form, {
        validators: zod4Client(loginSchema),
        applyAction: true,
        onResult: ({result}) => {
            if (result.type === 'failure') {
                const message = result.data?.message || m.error_occurred();
                toast.error(message);
            }
        }
    });
    
    const {form: formData, enhance} = form;
</script>

<div class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
        <a class="flex items-center gap-2 self-center font-medium" href="##">
            <div
                    class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"
            >
                <GalleryVerticalEndIcon class="size-4"/>
            </div>
            RAG by Tabularis.ai
        </a>
        <div class="flex flex-col gap-6">
            <Card.Root>
                <Card.Header class="text-center">
                    <Card.Title class="text-xl">{m.auth_welcome_back()}</Card.Title>
                    <Card.Description>{m.auth_login_with_credentials()}</Card.Description>
                </Card.Header>
                <Card.Content>
                    <form method="POST" use:enhance>
                        <div class="grid gap-6">
                            <div class="grid gap-6">
                                <Form.Field {form} name="email">
                                    <Form.Control>
                                        {#snippet children({props})}
                                            <Form.Label>{m.field_email()}</Form.Label>
                                            <Input
                                                    {...props}
                                                    bind:value={$formData.email}
                                                    placeholder="m@example.com"
                                                    type="email"
                                            />
                                        {/snippet}
                                    </Form.Control>
                                    <Form.FieldErrors/>
                                </Form.Field>
                                <Form.Field {form} name="password">
                                    <Form.Control>
                                        {#snippet children({props})}
                                            <div class="flex items-center">
                                                <Form.Label>{m.field_password()}</Form.Label>
                                                <a
                                                        class="ml-auto text-sm underline-offset-4 hover:underline"
                                                        href="/forget-pw"
                                                >
                                                    {m.auth_forgot_password()}
                                                </a>
                                            </div>
                                            <Input
                                                    {...props}
                                                    bind:value={$formData.password}
                                                    type="password"
                                            />
                                        {/snippet}
                                    </Form.Control>
                                    <Form.FieldErrors/>
                                </Form.Field>
                                <Button class="w-full" type="submit">{m.auth_login()}</Button>
                            </div>
                            <div class="text-center text-sm">
                                {m.auth_no_account()}
                                <a class="underline underline-offset-4" href="/register">
                                    {m.auth_signup()}
                                </a>
                            </div>
                        </div>
                    </form>
                </Card.Content>
            </Card.Root>
            <div
                    class="text-muted-foreground *:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4 text-balance text-center text-xs"
            >
                {m.legal_terms_agree()} <a href="##">{m.legal_terms_service()}</a>
                {` ${m.legal_and()} `}<a href="##">{m.legal_privacy()}</a>.
            </div>
        </div>
    </div>
</div>