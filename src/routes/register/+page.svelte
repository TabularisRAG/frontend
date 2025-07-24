<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Form from "$lib/components/ui/form";
    import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
    import {Input} from "$lib/components/ui/input";
    import {Button} from "$lib/components/ui/button";
    import {m} from "$lib/paraglide/messages";
    import type {PageProps} from "./$types";
    import {superForm} from "sveltekit-superforms";
    import {zod4Client} from "sveltekit-superforms/adapters";
    import {registerSchema} from "./schema";
    import {toast} from "svelte-sonner";

    let {data}: PageProps = $props();

    const form = superForm(data.form, {
        validators: zod4Client(registerSchema),
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
                    <Card.Title class="text-xl">{m.auth_create_account()}</Card.Title>
                    <Card.Description>{m.auth_enter_details()}</Card.Description>
                </Card.Header>
                <Card.Content>
                    <form method="POST" use:enhance>
                        <div class="grid gap-6">
                            <Form.Field {form} name="email">
                                <Form.Control>
                                    {#snippet children({props})}
                                        <Form.Label>{m.field_email()}</Form.Label>
                                        <Input {...props} bind:value={$formData.email} type="email"/>
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors/>
                            </Form.Field>
                            <Form.Field {form} name="firstName">
                                <Form.Control>
                                    {#snippet children({props})}
                                        <Form.Label>{m.field_first_name()}</Form.Label>
                                        <Input {...props} bind:value={$formData.firstName} type="text"/>
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors/>
                            </Form.Field>
                            <Form.Field {form} name="lastName">
                                <Form.Control>
                                    {#snippet children({props})}
                                        <Form.Label>{m.field_last_name()}</Form.Label>
                                        <Input {...props} bind:value={$formData.lastName} type="text"/>
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors/>
                            </Form.Field>
                            <Form.Field {form} name="password">
                                <Form.Control>
                                    {#snippet children({props})}
                                        <Form.Label>{m.field_password()}</Form.Label>
                                        <Input {...props} bind:value={$formData.password} type="password"/>
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors/>
                            </Form.Field>
                            {#if $formData.password !== ""}
                                <Form.Field {form} name="confirmPassword">
                                    <Form.Control>
                                        {#snippet children({props})}
                                            <Form.Label>{m.field_confirm_password()}</Form.Label>
                                            <Input {...props} bind:value={$formData.confirmPassword} type="password"/>
                                        {/snippet}
                                    </Form.Control>
                                    <Form.FieldErrors/>
                                </Form.Field>
                            {/if}

                            <Button class="w-full" type="submit">
                                {m.auth_register()}
                            </Button>
                        </div>
                    </form>
                </Card.Content>
            </Card.Root>
            <div class="text-center text-sm">
                {m.auth_have_account()}
                <a class="underline underline-offset-4" href="/login">{m.auth_login()}</a>
            </div>
        </div>
    </div>
</div>