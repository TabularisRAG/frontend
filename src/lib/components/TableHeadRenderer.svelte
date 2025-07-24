<script lang="ts">
    import type { Snippet } from 'svelte'
    import {TableHeader} from "$lib/components/ui/table";

    interface Props {
        children?: Snippet
    }
    const { children }: Props = $props()
</script>

<TableHeader>{@render children?.()}</TableHeader>