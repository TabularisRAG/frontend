<script lang="ts">
    import type { Snippet } from 'svelte'
    import {Table} from "$lib/components/ui/table";

    interface Props {
        children?: Snippet
    }
    const { children }: Props = $props()
</script>

<Table>{@render children?.()}</Table>