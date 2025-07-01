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

    let {data}: PageProps = $props();

    const form = superForm(data.form, {
        validators: zod4Client(registerSchema)
    })
    const {form: formData, enhance} = form

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
                    <Card.Title class="text-xl">{m.create_account()}</Card.Title>
                    <Card.Description>{m.enter_details_below()}</Card.Description>
                </Card.Header>
                <Card.Content>
                    <form method="POST" use:enhance>
                        <div class="grid gap-6">
                            <Form.Field {form} name="email">
                                <Form.Control>
                                    {#snippet children({props})}
                                        <Form.Label>{m.email()}</Form.Label>
                                        <Input {...props} bind:value={$formData.email} type="email"/>
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors/>
                            </Form.Field>
                            <Form.Field {form} name="firstName">
                                <Form.Control>
                                    {#snippet children({props})}
                                        <Form.Label>{m.first_name()}</Form.Label>
                                        <Input {...props} bind:value={$formData.firstName} type="text"/>
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors/>
                            </Form.Field>
                            <Form.Field {form} name="lastName">
                                <Form.Control>
                                    {#snippet children({props})}
                                        <Form.Label>{m.last_name()}</Form.Label>
                                        <Input {...props} bind:value={$formData.lastName} type="text"/>
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors/>
                            </Form.Field>
                            <Form.Field {form} name="password">
                                <Form.Control>
                                    {#snippet children({props})}
                                        <Form.Label>{m.password()}</Form.Label>
                                        <Input {...props} bind:value={$formData.password} type="password"/>
                                    {/snippet}
                                </Form.Control>
                                <Form.FieldErrors/>
                            </Form.Field>
                            {#if $formData.password !== ""}
                                <Form.Field {form} name="confirmPassword">
                                    <Form.Control>
                                        {#snippet children({props})}
                                            <Form.Label>{m.confirm_password()}</Form.Label>
                                            <Input {...props} bind:value={$formData.confirmPassword} type="password"/>
                                        {/snippet}
                                    </Form.Control>
                                    <Form.FieldErrors/>
                                </Form.Field>
                            {/if}

                            <Button class="w-full" type="submit">
                                {m.register()}
                            </Button>
                        </div>
                    </form>
                </Card.Content>
            </Card.Root>
            <div class="text-center text-sm">
                {m.already_have_account()}
                <a class="underline underline-offset-4" href="/login">{m.login()}</a>
            </div>
        </div>
    </div>
</div>
