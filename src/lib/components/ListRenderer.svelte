<script lang="ts">
    import type { Snippet } from 'svelte'

    interface Props {
        ordered?: boolean
        start?: number
        children?: Snippet
    }

    const { ordered = false, start = 1, children }: Props = $props()
</script>

{#if ordered}
    <ol {start} class="list-decimal ml-6 my-3">{@render children?.()}</ol>
{:else}
    <ul class="list-disc ml-6 my-3">{@render children?.()}</ul>
{/if}