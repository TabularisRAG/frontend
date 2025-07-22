<script lang="ts">
    import type { Snippet } from 'svelte'
    import {TableRow} from "$lib/components/ui/table";

    interface Props {
        children?: Snippet
    }
    const { children }: Props = $props()
</script>

<TableRow>{@render children?.()}</TableRow>