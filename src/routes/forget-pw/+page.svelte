<script lang="ts">
    import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
    import {m} from "$lib/paraglide/messages";
    import type {PageProps} from './$types';
    import {browser} from '$app/environment';
    import {onMount} from 'svelte';
    import {toast} from "svelte-sonner";
    import * as Card from "$lib/components/ui/card";
    import * as Form from "$lib/components/ui/form";
    import {Label} from "$lib/components/ui/label";
    import {Input} from "$lib/components/ui/input";
    import {Button} from "$lib/components/ui/button";
    import {superForm} from "sveltekit-superforms";
    import {zod4Client} from "sveltekit-superforms/adapters";
    import {forgetPasswordSchema} from "./schema";

    let {data}: PageProps = $props();
    
    onMount(() => {
        if (data.success) {
            toast.success("Password reset successfully! Your account has been deactivated and requires admin reactivation.");
        }
        
        if (data.error) {
            toast.error(m.error_occurred());
        }
    });

    const form = superForm(data.form, {
        validators: zod4Client(forgetPasswordSchema)
    });
    const {form: formData, enhance} = form;
</script>

<div class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
        <a class="flex items-center gap-2 self-center font-medium" href="##">
            <div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon class="size-4"/>
            </div>
            RAG by Tabularis.ai
        </a>
        <div class="flex flex-col gap-6">
            <Card.Root>
                <Card.Header class="text-center">
                    <Card.Title class="text-xl">Reset Password</Card.Title>
                    <Card.Description>Enter your email and new password to reset your account password</Card.Description>
                </Card.Header>
                <Card.Content>
                    <form method="POST" use:enhance>
                        <div class="grid gap-6">
                            <div class="grid gap-6">
                                <Form.Field {form} name="email">
                                    <Form.Control>
                                        {#snippet children({props})}
                                            <Form.Label>{m.email()}</Form.Label>
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
                                
                                <Form.Field {form} name="newPassword">
                                    <Form.Control>
                                        {#snippet children({props})}
                                            <Form.Label>New Password</Form.Label>
                                            <Input
                                                {...props}
                                                bind:value={$formData.newPassword}
                                                type="password"
                                                placeholder="Enter new password"
                                            />
                                        {/snippet}
                                    </Form.Control>
                                    <Form.FieldErrors/>
                                </Form.Field>
                                
                                <Form.Field {form} name="confirmPassword">
                                    <Form.Control>
                                        {#snippet children({props})}
                                            <Form.Label>Confirm New Password</Form.Label>
                                            <Input
                                                {...props}
                                                bind:value={$formData.confirmPassword}
                                                type="password"
                                                placeholder="Confirm new password"
                                            />
                                        {/snippet}
                                    </Form.Control>
                                    <Form.FieldErrors/>
                                </Form.Field>
                                
                                <!-- Important Notice -->
                                <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                                    <div class="flex items-start gap-2">
                                        <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                        </svg>
                                        <p><strong>Important:</strong> After resetting your password, your account will be deactivated and an admin will need to reactivate it before you can log in.</p>
                                    </div>
                                </div>
                                
                                <Button class="w-full" type="submit">Reset Password</Button>
                            </div>
                            <div class="text-center text-sm">
                                Remember your password?
                                <a class="underline underline-offset-4" href="/login">
                                    Back to Login
                                </a>
                            </div>
                        </div>
                    </form>
                </Card.Content>
            </Card.Root>
            <div class="text-muted-foreground *:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4 text-balance text-center text-xs">
                {m.terms_agree()} <a href="##">{m.terms_of_service()}</a>
                {` ${m.and()} `}<a href="##">{m.privacy_policy()}</a>.
            </div>
        </div>
    </div>
</div>