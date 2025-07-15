<script lang="ts">
    import {superForm, filesProxy} from "sveltekit-superforms";
    import {zod4} from "sveltekit-superforms/adapters";
    import type {PageData} from "./$types";
    import {schema} from "./schema";
    import {m} from '$lib/paraglide/messages.js';
    import {Field, Control, Label, Description, FieldErrors} from "formsnap";
    import Button from "$lib/components/ui/button/button.svelte";
    import {toast} from "svelte-sonner";
    import {
        displaySize,
        FileDropZone,
        type FileDropZoneProps,
    } from "$lib/components/ui/file-drop-zone";
    import {fly, slide} from "svelte/transition";
    import Trash2 from "@lucide/svelte/icons/trash-2";
    import Paperclip from "@lucide/svelte/icons/paperclip";

    const onFileRejected: FileDropZoneProps["onFileRejected"] = async ({reason, file}) => {
        toast.error(`${file.name} failed to upload!`, {description: reason});
    };
    import {Input} from "$lib/components/ui/input";
    import {TagsInput} from "$lib/components/ui/tags-input";

    let {
        data
    }: {
        data: PageData;
    } = $props();

    let form = superForm(data.form, {
        validators: zod4(schema),
        onUpdated(event) {
            if (event.form.valid) {
                keywords_value = [];
            }
        }
    });

    let {form: formData, enhance, message} = form;
    let keywords_value = $state([]);
    $effect(() => {
        $formData.keywords = keywords_value;
    });
    let files_file = filesProxy(form, "file");
    let onUpload_file: FileDropZoneProps["onUpload"] = async (uploadedFiles) => {
        // we use set instead of an assignment since it accepts a File[]
        files_file.set([...Array.from($files_file), ...uploadedFiles]);
    };
</script>

<div class="m-8">
    <div class="flex flex-col items-center justify-center">
        <form class="w-full md:w-96 space-y-2 p-4 lg:p-0" enctype="multipart/form-data" method="post" use:enhance>
            <h2 class="text-2xl font-semibold leading-none tracking-tight">
                {m.doc_form_create()}
            </h2>
            <p class="text-sm text-muted-foreground">
                {m.doc_form_description()}
            </p>
            <div>
                <Field {form} name="file">
                    <Control>
                        {#snippet children({props})}
                            <Label>{m.doc_form_file_label()}</Label>
                            <FileDropZone
                                    onUpload={onUpload_file}
                                    {onFileRejected}
                                    accept="application/pdf,.pdf,
                                application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,
                                application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx,
                                application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,
                                text/plain,.txt,
                                text/html,.html,.htm,.shtml,.ehtml,
                                text/csv,.csv,
                                text/xml,.xml,.xsl,.xbl,
                                application/json,.json,
                                text/markdown,.md,.markdown,"
                                    maxFiles={1}
                                    text={m.file_upload_drag()}
                                    fileCountError={m.file_upload_max_error()}
                                    fileTypeError={m.file_upload_type_error()}
                                    fileCount={$files_file.length}
                                    class="my-1"
                            />
                            <input name="file" type="file" bind:files={$files_file} class="hidden"/>
                        {/snippet}
                    </Control>
                    <Description class="text-sm text-muted-foreground">
                        {m.doc_form_file_description()}
                    </Description>
                    <FieldErrors/>
                    <div class="flex flex-col">
                        {#each Array.from($files_file) as file, i (file.name)}
                            <div
                                    in:slide
                                    out:fly={{ x: 20 }}
                                    class="flex place-items-center justify-between gap-0.5 hover:bg-accent dark:hover:bg-accent/60 p-2 rounded-lg transition-all duration-200"
                            >
                                <div class="flex gap-2 items-center">
                                    <Paperclip/>
                                    <div class="flex flex-col">
                                        <span class="text-sm">{file.name}</span>
                                        <span class="text-xs text-muted-foreground"
                                        >{displaySize(file.size)}</span
                                        >
                                    </div>
                                </div>
                                <Button
                                        variant="outline"
                                        size="icon"
                                        class="hover:text-primary text-muted-foreground"
                                        onclick={() => {
                                        // we use set instead of an assignment since it accepts a File[]
                                        files_file.set([
                                          ...Array.from($files_file).slice(0, i),
                                          ...Array.from($files_file).slice(i + 1),
                                        ]);
                                    }}
                                >
                                    <Trash2/>
                                </Button>
                            </div>
                        {/each}
                    </div>
                </Field>
            </div>
            <div>
                <Field {form} name="title">
                    <Control>
                        {#snippet children({props})}
                            <Label class='font-medium'>{m.doc_field_title()}</Label>
                            <Input
                                    {...props}
                                    type="text"
                                    placeholder={m.doc_form_title_placeholder()}
                                    bind:value={$formData.title}
                            />
                            <Description class="text-muted-foreground text-xs">
                                {m.doc_form_title_description()}
                            </Description>
                        {/snippet}
                    </Control>
                    <FieldErrors class='text-sm text-destructive'/>
                </Field>
            </div>
            <div>
                <Field {form} name="year">
                    <Control>
                        {#snippet children({props})}
                            <Label class='font-medium'>{m.doc_field_year()}</Label>
                            <Input
                                    {...props}
                                    type="number"
                                    placeholder={m.doc_form_year_placeholder()}
                                    bind:value={$formData.year}
                            />
                            <Description class="text-muted-foreground text-xs">
                                {m.doc_form_year_description()}
                            </Description>
                        {/snippet}
                    </Control>
                    <FieldErrors class='text-sm text-destructive'/>
                </Field>
            </div>
            <div>
                <Field {form} name="author">
                    <Control>
                        {#snippet children({props})}
                            <Label class='font-medium'>{m.doc_field_author()}</Label>
                            <Input
                                    {...props}
                                    type="text"
                                    placeholder={m.doc_form_author_placeholder()}
                                    bind:value={$formData.author}
                            />
                            <Description class="text-muted-foreground text-xs">
                                {m.doc_form_author_description()}
                            </Description>
                        {/snippet}
                    </Control>
                    <FieldErrors class='text-sm text-destructive'/>
                </Field>
            </div>
            <div>
                <Field {form} name="keywords">
                    <Control>
                        {#snippet children({props})}
                            <Label>{m.doc_field_keywords()}</Label>
                            <TagsInput bind:value={keywords_value} placeholder={m.doc_form_keywords_placeholder()}/>
                            {#each $formData.keywords as item, i}
                                <input
                                        {...props}
                                        type="hidden"
                                        bind:value={$formData.keywords[i]}
                                        name="keywords"
                                />
                            {/each}
                        {/snippet}
                    </Control>
                    <Description class="text-xs text-muted-foreground">{m.doc_form_keywords_description()}</Description
                    >
                    <FieldErrors class="text-sm text-destructive"/>
                </Field>
            </div>
            <div class="mt-4">
                <Button size="sm" class="w-full" type="submit">{m.action_submit()}</Button>
            </div>
        </form>
    </div>
</div>