<script lang="ts">
    import type { Snippet } from 'svelte'
    import {TableBody} from "$lib/components/ui/table";

    interface Props {
        children?: Snippet
    }
    const { children }: Props = $props()
</script>

<TableBody>{@render children?.()}</TableBody>