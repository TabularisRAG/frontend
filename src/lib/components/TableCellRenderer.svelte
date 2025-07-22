<script lang="ts">
    import type { Snippet } from 'svelte'
    import {TableCell, TableHead} from "$lib/components/ui/table";

    interface Props {
        header: boolean
        align: 'left' | 'center' | 'right' | 'justify' | 'char' | null | undefined
        children?: Snippet
    }

    const { header, align, children }: Props = $props()

    // Convert alignment to style object if alignment is specified
    const style = $derived(align ? `text-align: ${align}` : undefined)
</script>

{#if header}
    <TableHead {style} class="font-bold">{@render children?.()}</TableHead>
{:else}
    <TableCell {style}>{@render children?.()}</TableCell>
{/if}