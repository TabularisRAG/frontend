<script lang="ts">
    import type { Snippet } from 'svelte'

    interface Props {
        depth: number
        raw: string
        text: string
        options: any
        slug: (val: string) => string // eslint-disable-line no-unused-vars
        children?: Snippet
    }

    const { depth, raw, text, options, slug, children }: Props = $props()

    const id = $derived(options.headerIds ? options.headerPrefix + slug(text) : undefined)
</script>

{#if depth === 1}
    <h1 {id} class="text-3xl font-semibold mb-4 mt-5">{@render children?.()}</h1>
{:else if depth === 2}
    <h2 {id} class="text-2xl font-semibold mb-3 mt-4">{@render children?.()}</h2>
{:else if depth === 3}
    <h3 {id} class="text-xl font-semibold mb-2 mt-3">{@render children?.()}</h3>
{:else if depth === 4}
    <h4 {id} class="text-lg font-semibold mb-1 mt-2">{@render children?.()}</h4>
{:else if depth === 5}
    <h5 {id} class="font-semibold mb-0.5 mt-1">{@render children?.()}</h5>
{:else if depth === 6}
    <h6 {id} class="font-semibold">{@render children?.()}</h6>
{:else}
    {raw}
{/if}