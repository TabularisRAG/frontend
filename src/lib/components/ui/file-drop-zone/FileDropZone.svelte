<script lang="ts" module>
    import type {Snippet} from "svelte";
    import type {HTMLInputAttributes} from "svelte/elements";
    import {m} from '$lib/paraglide/messages.js';

    export interface FileDropZoneProps
        extends Omit<HTMLInputAttributes, "multiple"> {
        /** Called with the uploaded files when the user drops or clicks and selects their files.
         *
         * @param files
         */
        onUpload: (files: File[]) => Promise<void>;
        /** The maximum amount files allowed to be uploaded */
        maxFiles?: number;
        fileCount?: number;
        text: string;
        fileTypeError: string;
        fileCountError: string;
        children?: Snippet<[]>;
        /** Called when a file does not meet the upload criteria (size, or type) */
        onFileRejected?: (opts: { reason: string; file: File }) => void;

        // just for extra documentation
        /** Takes a comma separated list of one or more file types.
         *
         *  [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept)
         *
         * ### Usage
         * ```svelte
         * <FileDropZone
         *        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
         * />
         * ```
         *
         * ### Common Values
         * ```svelte
         * <FileDropZone accept="audio/*"/>
         * <FileDropZone accept="image/*"/>
         * <FileDropZone accept="video/*"/>
         * ```
         */
        accept?: string;
    }
</script>

<script lang="ts">
    import Upload from "@lucide/svelte/icons/upload";
    import {displaySize} from "./index";
    import {useId} from "bits-ui";

    let {
        id = useId(),
        children,
        maxFiles,
        text,
        fileTypeError,
        fileCountError,
        fileCount,
        disabled = false,
        onUpload,
        onFileRejected,
        accept,
        class: className,
        ...rest
    }: FileDropZoneProps = $props();

    let uploading = $state(false);

    const drop = async (
        e: DragEvent & {
            currentTarget: EventTarget & HTMLLabelElement;
        }
    ) => {
        if (disabled || !canUploadFiles) return;

        e.preventDefault();

        const droppedFiles = Array.from(e.dataTransfer?.files ?? []);

        await upload(droppedFiles);
    };

    const change = async (
        e: Event & {
            currentTarget: EventTarget & HTMLInputElement;
        }
    ) => {
        if (disabled) return;

        const selectedFiles = e.currentTarget.files;

        if (!selectedFiles) return;

        await upload(Array.from(selectedFiles));

        // this if a file fails and we upload the same file again we still get feedback
        (e.target as HTMLInputElement).value = "";
    };

    const shouldAcceptFile = (
        file: File,
        fileNumber: number
    ): string | undefined => {
        if (maxFiles !== undefined && fileNumber > maxFiles)
            return fileCountError;

        if (!accept) return undefined;

        const acceptedTypes = accept.split(",").map((a) => a.trim().toLowerCase());
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();

        const isAcceptable = acceptedTypes.some((pattern) => {
            // check extension like .mp4
            if (fileType.startsWith(".")) {
                return fileName.endsWith(pattern);
            }

            // if pattern has wild card like video/*
            if (pattern.endsWith("/*")) {
                const baseType = pattern.slice(0, pattern.indexOf("/*"));
                return fileType.startsWith(baseType + "/");
            }

            // otherwise it must be a specific type like video/mp4
            return fileType === pattern;
        });

        if (!isAcceptable) return fileTypeError;

        return undefined;
    };

    const upload = async (uploadFiles: File[]) => {
        uploading = true;

        const validFiles: File[] = [];

        for (let i = 0; i < uploadFiles.length; i++) {
            const file = uploadFiles[i];

            const rejectedReason = shouldAcceptFile(file, (fileCount ?? 0) + i + 1);

            if (rejectedReason) {
                onFileRejected?.({file, reason: rejectedReason});
                continue;
            }

            validFiles.push(file);
        }

        await onUpload(validFiles);

        uploading = false;
    };

    const canUploadFiles = $derived(
        !disabled &&
        !uploading &&
        !(
            maxFiles !== undefined &&
            fileCount !== undefined &&
            fileCount >= maxFiles
        )
    );
</script>

<label
        aria-disabled={!canUploadFiles}
        class={[
    "flex h-40 w-full place-items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-all hover:cursor-pointer hover:bg-accent/25 aria-disabled:opacity-50 aria-disabled:hover:cursor-not-allowed",
    className,
  ]}
        for={id}
        ondragover={(e) => e.preventDefault()}
        ondrop={drop}
>
    {#if children}
        {@render children()}
    {:else}
        <div class="flex flex-col place-items-center justify-center gap-2">
            <div
                    class="flex size-14 place-items-center justify-center rounded-full border border-dashed border-border text-muted-foreground"
            >
                <Upload class="size-7"/>
            </div>
            <div class="flex flex-col gap-0.5 text-center">
                <span class="font-medium text-muted-foreground">{text}</span>
                {#if maxFiles}
                      <span class="text-sm text-muted-foreground/75">
                          {m['general.input.file.can_upload_count']({count: maxFiles})}
                      </span>
                {/if}
            </div>
        </div>
    {/if}
    <input
            {...rest}
            {accept}
            class="hidden"
            disabled={!canUploadFiles}
            {id}
            multiple={maxFiles === undefined || maxFiles - (fileCount ?? 0) > 1}
            onchange={change}
            type="file"
    />
</label>